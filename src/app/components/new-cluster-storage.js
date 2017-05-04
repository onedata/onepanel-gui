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
} = Ember;

export default Ember.Component.extend({
  storageManager: service(),
  globalNotify: service(),

  noStorages: computed.equal('storages.length', 0),

  /**
   * @type {ObjectPromiseProxy} storagesProxy resolves with storages list ArrayProxy
   */
  storagesProxy: null,

  addStorageOpened: computed.oneWay('noStorages'),

  init() {
    this._super(...arguments);
    this._updateStoragesProxy();
  },

  /**
   * Force update storages list - makes an API call
   */
  _updateStoragesProxy() {
    let storageManager = this.get('storageManager');
    this.set('storagesProxy', storageManager.getStorages(true));
  },

  /**
   * Uses API to add new storage and updated storages list from remote if succeeds
   * @param {object} storageFormData should have properties needed to construct
   *  onepanel storage model
   */
  _submitAddStorage(storageFormData) {
    let {
      storageManager,
    } = this.getProperties('storageManager');

    let cs = createClusterStorageModel(storageFormData);

    let addingStorage = storageManager.createStorage(cs);

    return new Promise((resolve, reject) => {
      addingStorage.then(() => {
        this._updateStoragesProxy();
        this.set('addStorageOpened', false);
        resolve();
      });
      addingStorage.catch(reject);
    });
  },

  _addStorageButtonLabel: computed('addStorageOpened', function () {
    return this.get('addStorageOpened') ? 'Cancel' : 'Add storage';
  }),

  actions: {
    next() {
      invokeAction(this, 'nextStep');
    },
    toggleAddStorageForm() {
      this.toggleProperty('addStorageOpened');
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
