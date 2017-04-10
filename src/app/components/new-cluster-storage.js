import Ember from 'ember';
import createClusterStorageModel from 'ember-onedata-onepanel-server/utils/create-cluster-storage-model';
import Onepanel from 'npm:onepanel';

import { invokeAction } from 'ember-invoke-action';

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

const {
  ClusterStoragesList
} = Onepanel;

export default Ember.Component.extend({
  onepanelServer: service(),

  // TODO sync with API
  noStorages: computed.equal('storages.length', 0),

  storages: A(),

  addStorageOpened: computed.oneWay('noStorages'),

  _addStorageButtonLabel: computed('addStorageOpened', function() {
    return this.get('addStorageOpened') ? 'Cancel' : 'Add storage';
  }),

  actions: {
    next() {
      invokeAction(this, 'nextStep');
    },
    toggleAddStorageForm() {
      this.toggleProperty('addStorageOpened');
    },
    submitAddStorage(storageFormData) {
      let {
        onepanelServer,
        storages,
      } = this.getProperties('storages', 'onepanelServer');

      let storageName = storageFormData.name;
      let cs = createClusterStorageModel(storageFormData);

      let csListProto = {};
      csListProto[storageName] = cs;

      let csList = ClusterStoragesList.constructFromObject(csListProto);

      return new Promise((resolve, reject) => {
        let addingStorage =
          onepanelServer.request('oneprovider', 'addStorage', csList);

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
