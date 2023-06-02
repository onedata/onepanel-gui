/**
 * Storage management for cluster - can be used both in wizard and after cluster deployment
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

import { equal, oneWay, alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { Promise } from 'rsvp';
import { get, computed } from '@ember/object';
import GlobalActions from 'onedata-gui-common/mixins/components/global-actions';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import storageTypes from 'onepanel-gui/utils/cluster-storage/storage-types';
import createClusterStorageModel from 'ember-onedata-onepanel-server/utils/create-cluster-storage-model';
import computedT from 'onedata-gui-common/utils/computed-t';
import { reads } from '@ember/object/computed';
import ArrayPaginator from 'onedata-gui-common/utils/array-paginator';
import { raw, or, array } from 'ember-awesome-macros';

export default Component.extend(I18n, GlobalActions, {
  storageManager: service(),
  storageActions: service(),
  spaceManager: service(),
  globalNotify: service(),
  i18n: service(),

  classNames: ['manage-cluster-storages'],

  /**
   * @override
   */
  i18nPrefix: 'components.manageClusterStorages',

  /**
   * @override
   */
  globalActionsTitle: computedT('storages'),

  /**
   * @virtual
   * @type {() => void}
   */
  nextStep: undefined,

  /**
   * @type {Utils.ArrayPaginator}
   */
  paginator: undefined,

  /**
   * @type {PromiseObject} storagesProxy resolves with storages list ArrayProxy
   */
  storagesProxy: null,

  /**
   * @type {PromiseObject} spacesProxy resolves with spaces list ArrayProxy
   */
  spacesProxy: null,

  /**
   * Id of the storage type, which should be passed to the
   * ClusterStorageAddForm. If valid, will open create form at component load.
   * @virtual
   */
  createStorageFormTypeId: undefined,

  pageSize: 10,

  /**
   * @type {boolean}
   */
  storageToRemove: false,

  /**
   * @type {boolean}
   */
  isRemovingStorage: false,

  storages: reads('storagesProxy.content'),

  /**
   * @type {ComputedProperty<Array<PromiseObject<StorageDetails>>>}
   */
  storagesSorted: array.sort('storages', ['name', 'conflictLabel']),

  /**
   * If true, there are no storages
   * @type {computed.boolean}
   */
  noStorages: equal('storagesProxy.length', 0),

  /**
   * Form for adding new storage is opened or not?
   * @type {computed.boolean}
   */
  addStorageOpened: oneWay('noStorages'),

  /**
   * @type {Ember.ComputedProperty<Object>}
   */
  createStorageFormType: computed(
    'createStorageFormTypeID',
    function createStorageFormType() {
      const createStorageFormTypeId = this.get('createStorageFormTypeId');
      if (createStorageFormTypeId) {
        const storage = storageTypes.findBy('id', createStorageFormTypeId);
        if (storage) {
          return storage;
        }
      }
    }
  ),

  /**
   * If true, render additional finish button that will invoke "nextStep" action
   * Used in wizard
   * @type {computed.boolean}
   */
  finishButton: computed('nextStep', function () {
    return this.get('nextStep') != null;
  }),

  dataIsLoading: computed(
    'storagesProxy.isPending',
    'spacesProxy.isPending',
    function () {
      return this.get('storagesProxy.isPending') || this.get('spacesProxy.isPending');
    }
  ),

  storagesError: alias('storagesProxy.reason'),

  someStorageIsLoading: computed('storagesProxy.content.@each.isSettled', function () {
    const storages = this.get('storagesProxy.content');
    if (storages) {
      return storages.toArray().some(sp => get(sp, 'isPending'));
    }
  }),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  addStorageAction: computed('addStorageOpened', function () {
    const addStorageOpened = this.get('addStorageOpened');
    return {
      action: () => this.send('toggleAddStorageForm'),
      title: this.t(addStorageOpened ? 'cancel' : 'addStorage'),
      icon: addStorageOpened ? undefined : 'add-filled',
      class: 'btn-add-storage',
      buttonStyle: addStorageOpened ? 'default' : 'primary',
    };
  }),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  finishAction: computed(function () {
    return {
      action: () => this.send('next'),
      title: this.t('finish'),
      class: 'btn-next-step',
      buttonStyle: 'primary',
    };
  }),

  /**
   * @override
   * @type {Ember.ComputedProperty<Array<Action>>}
   */
  globalActions: computed(
    'addStorageAction',
    'finishButton',
    'finishAction',
    'noStorages',
    function () {
      const {
        addStorageAction,
        finishButton,
        finishAction,
        noStorages,
      } = this.getProperties(
        'addStorageAction',
        'finishButton',
        'finishAction',
        'noStorages'
      );
      if (noStorages) {
        return [];
      } else {
        const actions = [addStorageAction];
        if (finishButton) {
          actions.push(finishAction);
        }
        return actions;
      }
    }
  ),

  init() {
    this._super(...arguments);
    this.set('paginator', ArrayPaginator.extend({
      array: or('parent.storagesSorted', raw([])),
      pageSize: reads('parent.pageSize'),
    }).create({
      parent: this,
    }));
    this._updateStoragesProxy();
    this._updateSpacesProxy(true);
    if (this.get('createStorageFormType')) {
      this.set('addStorageOpened', true);
    }
  },

  /**
   * Force update storages list - makes an API call
   * @returns {undefined}
   */
  _updateStoragesProxy() {
    const {
      storageManager,
      storagesProxy,
    } = this.getProperties('storageManager', 'storagesProxy');

    const newStoragesProxy = storageManager.getStorages(true);

    // first update - initialize component storagesProxy field
    if (!storagesProxy) {
      this.set('storagesProxy', newStoragesProxy);
    }

    return newStoragesProxy;
  },

  /**
   * Force update spaces list - makes an API call
   * @param {boolean} reload if true, force reload storages from backend
   * @returns {undefined}
   */
  _updateSpacesProxy(reload = true) {
    const spaceManager = this.get('spaceManager');
    this.set('spacesProxy', spaceManager.getSpaces(reload));
  },

  /**
   * Uses API to add new storage and updated storages list from remote if succeeds
   * @param {object} storageFormData should have properties needed to construct
   *  onepanel storage model
   * @returns {Promise<undefined|object>}
   */
  _submitAddStorage(storageFormData) {
    const {
      storageManager,
    } = this.getProperties('storageManager');

    const cs = createClusterStorageModel(storageFormData);

    const addingStorage = storageManager.createStorage(cs);

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
      const nextStep = this.get('nextStep');
      if (nextStep) {
        nextStep();
      }
    },
    toggleAddStorageForm() {
      this.toggleProperty('addStorageOpened');
    },

    /**
     * Create an instance of ClusterStorages using data from add storage form
     * @param {object} storageFormData contains attributes for specific storage type as in REST API
     * @param {object} storageFormData.type required attribute for storage
     * @param {object} storageFormData.name required attribute for storage
     * @returns {ClusterStorages} instance of ClusterStorages subclass
     */
    submitAddStorage(storageFormData) {
      const globalNotify = this.get('globalNotify');
      const { name } = storageFormData;
      const submitting = this._submitAddStorage(storageFormData);
      submitting.then(() => {
        globalNotify.info(this.t('storageAdded', { storageName: name }));
      });
      submitting.catch(error => {
        let storageError;
        try {
          storageError = error && typeof error === 'object' && error.response &&
            error.response.body && error.response.body[name] &&
            error.response.body[name].error || error.toString() || this.t('unknownError');
          if (typeof storageError === 'object') {
            storageError.message = storageError.description;
          }
        } catch (parseError) {
          storageError = this.t('unknownError');
        }
        globalNotify.backendError(
          this.t('addingStorage', { storageName: name }),
          storageError
        );
      });
      return submitting;
    },
    submitModifyStorage(storage, storageFormData) {
      const storageActions = this.get('storageActions');
      const newDetails = createClusterStorageModel(storageFormData, true);
      return storageActions.modifyStorage(storage, newDetails)
        .then(result => this._updateStoragesProxy().then(() => result));
    },
    submitRemoveStorage() {
      const {
        storageActions,
        storageToRemove,
      } = this.getProperties('storageActions', 'storageToRemove');
      this.set('isRemovingStorage', true);
      return storageActions.removeStorage(storageToRemove)
        .then(() => {
          this._updateStoragesProxy();
        })
        .finally(() => {
          safeExec(this, () => {
            this.setProperties({
              storageToRemove: null,
              isRemovingStorage: false,
            });
          });
        });
    },
  },
});
