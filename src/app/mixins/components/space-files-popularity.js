import { computed } from '@ember/object';
import Mixin from '@ember/object/mixin';

export default Mixin.create({
  /**
   * @virtual
   * @property space
   * @type {SpaceDetails}
   */

  /**
   * @type {Onepanel.FilesPopularity}
   */
  filesPopularity: computed.reads('space.filesPopularity'),
});
