import { A } from '@ember/array';
import Service from '@ember/service';
import ArrayProxy from '@ember/array/proxy';
import { Promise } from 'rsvp';

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

  getStorages() {
    return PromiseObject.create({
      promise: new Promise(resolve => {
        const storageDetailsList = A();
        for (const storageId in this.get('__storages')) {
          storageDetailsList.push(this.getStorageDetails(storageId));
        }
        resolve(ArrayProxy.create({ content: storageDetailsList }));
      }),
    });
  },

  getStorageDetails(id) {
    return PromiseObject.create({
      promise: new Promise((resolve) => resolve(this.get('__storages')[id])),
    });
  },
});
