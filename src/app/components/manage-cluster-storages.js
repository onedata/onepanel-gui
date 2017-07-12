/**
 * Storage management for cluster - can be used both in wizard and after cluster deployment
 *
 * @module components/manage-cluster-storages
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import { invokeAction } from 'ember-invoke-action';

import createClusterStorageModel from 'ember-onedata-onepanel-server/utils/create-cluster-storage-model';

const {
  computed,
  computed: {
    equal,
  },
  inject: {
    service
  },
  RSVP: {
    Promise
  },
} = Ember;

export default Ember.Component.extend({
  storageManager: service(),
  spaceManager: service(),
  globalNotify: service(),

  /**
   * If true, there are no storages
   * @type {computed.boolean}
   */
  noStorages: equal('storagesProxy.length', 0),

  /**
   * @type {ObjectPromiseProxy} storagesProxy resolves with storages list ArrayProxy
   */
  storagesProxy: null,

  /**
   * @type {ObjectPromiseProxy} spacesProxy resolves with spaces list ArrayProxy
   */
  spacesProxy: null,

  /**
   * Form for adding new storage is opened or not?
   * @type {computed.boolean}
   */
  addStorageOpened: computed.oneWay('noStorages'),

  /**
   * If true, render additional finish button that will invoke "nextStep" action
   * Used in wizard
   * @type {computed.boolean}
   */
  finishButton: computed('nextStep', function () {
    return this.get('nextStep') != null;
  }),

  init() {
    this._super(...arguments);
    this._updateStoragesProxy();
    this._updateSpacesProxy();
  },

  /**
   * Force update storages list - makes an API call
   */
  _updateStoragesProxy() {
    let storageManager = this.get('storageManager');
    this.set('storagesProxy', storageManager.getStorages(true));
  },

  /**
   * Force update spaces list - makes an API call
   */
  _updateSpacesProxy() {
    let spaceManager = this.get('spaceManager');
    this.set('spacesProxy', spaceManager.getSpaces());
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
        this.get('globalNotify').backendError(`adding "${name}" storage`, error);
      });
      return submitting;
    }
  }
});
