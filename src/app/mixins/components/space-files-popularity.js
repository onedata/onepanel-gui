import { computed } from '@ember/object';
import Mixin from '@ember/object/mixin';

export default Mixin.create({
  /**
   * @virtual
   * @type {Space}
   */
  space: undefined,

  /**
   * @type {Onepanel.FilesPopularity}
   */
  filesPopularity: computed.oneWay('space.filesPopularity'),
});
