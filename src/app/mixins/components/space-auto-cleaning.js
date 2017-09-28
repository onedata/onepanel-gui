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
   * Fetched on init
   * @type {Onepanel.AutoCleaning}
   */
  autoCleaning: computed.oneWay('autoCleaningProxy.content'),

  autoCleaningLoading: computed.oneWay('autoCleaningProxy.isPending'),
  autoCleaningError: computed('autoCleaningProxy.isRejected', function () {
    const autoCleaningProxy = this.get('autoCleaningProxy');
    if (get(autoCleaningProxy, 'isRejected')) {
      return get(autoCleaningProxy, 'reason');
    }
  }),

  /**
   * @type {Ember.ComputedProperty<PromiseObject<Onepanel.AutoCleaning>|undefined>}
   */
  autoCleaningProxy: computed('filesPopularity.enabled', function () {
    if (this.get('filesPopularity.enabled') === true) {
      return PromiseObject.create({
        promise: this._getAutoCleaning(),
      });
    }
  }),

  /**
   * @returns {Promise<Onepanel.AutoCleaning>}
   */
  _getAutoCleaning() {
    const {
      spaceManager,
      space,
    } = this.getProperties('spaceManager', 'space');
    return spaceManager.getAutoCleaning(get(space, 'id'))
      .then(autoCleaning => this.set('autoCleaning', autoCleaning));
  },

});
