import { computed, get } from '@ember/object';
import Mixin from '@ember/object/mixin';
import { inject } from '@ember/service';

export default Mixin.create({
  spaceManager: inject(),

  filesPopularity: undefined,

  init() {
    this._super(...arguments);
    const {
      spaceManager,
      space,
    } = this.getProperties('spaceManager', 'space');
    const spaceId = get(space, 'id');
    spaceManager.getFilesPopularity(spaceId)
      .then(filesPopularity => this.set('filesPopularity', filesPopularity));
  },

});
