import { computed, get } from '@ember/object';
import Mixin from '@ember/object/mixin';

import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';

export default Mixin.create({
  /**
   * @virtual
   * @type {Ember.Service}
   */
  spaceManager: undefined,

  /**
   * @virtual
   * @type {Space}
   */
  space: undefined,

  /**
   * @type {Onepanel.FilesPopularity}
   */
  filesPopularity: computed.oneWay('filesPopularityProxy.content'),

  filesPopularityLoading: computed.oneWay('filesPopularityProxy.isPending'),
  filesPopularityError: computed('filesPopularityProxy.isRejected', function () {
    const filesPopularityProxy = this.get('filesPopularityProxy');
    if (get(filesPopularityProxy, 'isRejected')) {
      return get(filesPopularityProxy, 'reason');
    }
  }),

  /**
   * @type {Ember.ComputedProperty<PromiseObject<Onepanel.FilesPopularity>|undefined>}
   */
  filesPopularityProxy: computed(function () {
    return PromiseObject.create({
      promise: this._getFilesPopularity(),
    });
  }),

  /**
   * @returns {Promise<Onepanel.FilesPopularity>}
   */
  _getFilesPopularity() {
    const {
      spaceManager,
      space,
    } = this.getProperties('spaceManager', 'space');
    return spaceManager.getFilesPopularity(get(space, 'id'))
      .then(filesPopularity => this.set('filesPopularity', filesPopularity));
  },

});
