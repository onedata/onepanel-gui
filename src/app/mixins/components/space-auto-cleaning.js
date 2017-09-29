import { computed } from '@ember/object';
import Mixin from '@ember/object/mixin';

export default Mixin.create({
  /**
   * @virtual
   * @type {Space}
   */
  space: undefined,

  /**
   * Fetched on init
   * @type {Onepanel.AutoCleaning}
   */
  autoCleaning: computed.oneWay('space.autoCleaning'),
});
