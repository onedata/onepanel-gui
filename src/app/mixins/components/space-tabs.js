import { computed } from '@ember/object';
import Mixin from '@ember/object/mixin';

export default Mixin.create({
  tabStorageSynchronization: computed('importEnabled', function () {
    return this.get('importEnabled');
  }),

  tabFilesPopularity: computed(function () {

  }),

  tabAutoCleaning: computed(function () {

  }),
});
