import Service from '@ember/service';
import { Promise } from 'rsvp';
import BatchResolver from 'onedata-gui-common/utils/batch-resolver';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';

export default Service.extend({
  /**
   * Add storages here in tests (key: storage id, value: storage object)
   */
  __storages: undefined,

  init() {
    this._super(...arguments);
    this.set('__storages', {});
  },

  async getStoragesBatchResolver() {
    const fetchFunctions = Object.keys(this.__storages).map(storageId => {
      return () => {
        return this.getStorageDetails(storageId);
      };
    });
    return BatchResolver.create({
      promiseFunctions: fetchFunctions,
      chunkSize: 20,
    });
  },

  getStorageDetails(id) {
    return PromiseObject.create({
      promise: new Promise((resolve) => resolve(this.get('__storages')[id])),
    });
  },
});
