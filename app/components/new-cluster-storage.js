import Ember from 'ember';
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
  ClusterStorages
} = Onepanel;

export default Ember.Component.extend({
  onepanelServer: service(),

  // TODO sync with API
  noStorages: computed.equal('storages.length', 0),

  storages: A(),

  addStorageOpened: false,

  actions: {
    next() {
      invokeAction(this, 'nextStep');
    },
    startAddStorage() {
      this.set('addStorageOpened', true);
    },
    submitAddStorage(storageFormData) {
      let {
        onepanelServer,
        storages,
      } = this.getProperties('storages', 'onepanelServer');

      // TODO debug code
      console.debug(JSON.stringify(storageFormData));

      let cs = ClusterStorages.constructFromObject(storageFormData);

      return new Promise((resolve, reject) => {
        let addingStorage =
          onepanelServer.request('oneprovider', 'addStorage', cs);

        addingStorage.then(() => {
          storages.pushObject(storageFormData);
          this.set('addStorageOpened', false);
        });
        addingStorage.catch(reject);
      });
    }
  }
});
