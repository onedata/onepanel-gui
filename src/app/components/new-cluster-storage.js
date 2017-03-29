import Ember from 'ember';
import Onepanel from 'npm:onepanel';
import { invokeAction } from 'ember-invoke-action';

import createClusterStorageModel from 'ember-onedata-onepanel-server/utils/create-cluster-storage-model';

const {
  computed,
  inject: {
    service
  },
  RSVP: {
    Promise
  },
  A
} = Ember;

export default Ember.Component.extend({
  onepanelServer: service(),

  // TODO sync with API
  noStorages: computed.equal('storages.length', 0),

  storages: A(),

  addStorageOpened: false,

  _submitAddStorage() {

  },

  actions: {
    next() {
      invokeAction(this, 'nextStep');
    },
    startAddStorage() {
      this.set('addStorageOpened', true);
    },
    onAddStorageHide() {
      this.set('addStorageOpened', false);
    },

    /**
     * Create an instance of ClusterStorages using data from add storage form
     * @param {object} formData contains attributes for specific storage type as in REST API
     * @param {object} formData.type required attribute for storage
     * @param {object} formData.name required attribute for storage
     * @returns {subclass of ClusterStorages}
     */
    submitAddStorage(storageFormData) {
      let {
        storageManager,
        storages,
      } = this.getProperties('storages', 'storageManager');

      let cs = createClusterStorageModel(storageFormData);

      // FIXME a hack for future
      cs.name = storageFormData.name;

      let addingStorage = storageManager.createStorage(cs);

      return new Promise((resolve, reject) => {
        addingStorage.then(() => {
          storages.pushObject(cs);
          this.set('addStorageOpened', false);
          resolve();
        });
        addingStorage.catch(reject);
      });
    }
  }
});
