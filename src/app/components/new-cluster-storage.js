/**
 * A storage management content for wizard of creating new cluster
 *
 * @module components/new-cluster-storage.js
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
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
  storageManager: service(),
  globalNotify: service(),

  noStorages: computed.equal('storages.length', 0),

  storages: A(),

  addStorageOpened: computed.oneWay('noStorages'),

  _submitAddStorage(storageFormData) {
    let {
      storages,
      storageManager,
    } = this.getProperties('storages', 'storageManager');

    let cs = createClusterStorageModel(storageFormData);

    let addingStorage = storageManager.createStorage(cs);

    return new Promise((resolve, reject) => {
      addingStorage.then(() => {
        storages.pushObject(cs);
        this.set('addStorageOpened', false);
        resolve();
      });
      addingStorage.catch(reject);
    });
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
      let { name } = storageFormData;
      let submitting = this._submitAddStorage(storageFormData);
      submitting.then(() => {
        // TODO i18n
        this.get('globalNotify').info(`Storage "${name}" added`);
      });
      submitting.catch(error => {
        // TODO i18n
        this.get('globalNotify').error(`Failed to add storage "${name}": ${error}`);
      });
      return submitting;
    }
  }
});
