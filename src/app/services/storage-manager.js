/**
 * Provides backend model/operations for storages in onepanel
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { A } from '@ember/array';

import ObjectProxy from '@ember/object/proxy';
import ArrayProxy from '@ember/array/proxy';
import { observer, get } from '@ember/object';
import Service, { inject as service } from '@ember/service';
import { Promise, resolve } from 'rsvp';
import Onepanel from 'onepanel';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import addConflictLabels from 'onedata-gui-common/utils/add-conflict-labels';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import batchResolve from 'onedata-gui-common/utils/batch-resolve';

const {
  StorageCreateRequest,
  StorageModifyRequest,
} = Onepanel;

export default Service.extend({
  onepanelServer: service(),

  _collectionMap: undefined,

  /**
   * @type {Ember.ArrayProxy<ClusterStorage>}
   */
  collectionCache: undefined,

  /**
   * @type {Boolean}
   */
  collectionCacheInitialized: false,

  conflictNameObserver: observer(
    'collectionCache.content.@each.name',
    function conflictNameObserver() {
      addConflictLabels(
        this.get('collectionCache.content').filterBy('content').mapBy('content'),
        'name',
        'id'
      );
    }
  ),

  init() {
    this._super(...arguments);
    this.set('collectionCache', ArrayProxy.create({ content: [] }));
    this.set('_collectionMap', {});
  },

  async getStoragesIds() {
    return (await this.onepanelServer.requestValidData(
      'StoragesApi',
      'getStorages'
    ))?.data?.ids ?? [];
  },

  /**
   * @param {boolean} reload If true, even if there is collectionCache loaded, fetch
   *   storages from backend.
   * @returns {Promise<Ember.ArrayProxy<Ember.ObjectProxy<ClusterStorage>>>}
   *   proxies.
   */
  async getStoragesPromise(reload = false) {
    if (!reload && this.collectionCacheInitialized) {
      return this.collectionCache;
    }

    let ids = [];
    try {
      ids = await this.getStoragesIds();
    } catch (error) {
      if (error && error.response && error.response.statusCode === 404) {
        safeExec(this, () => {
          this.set('collectionCache.content', A());
          this.set('collectionCacheInitialized', true);
        });
        return this.collectionCache;
      } else {
        throw error;
      }
    }

    const storageFetchFunctions = ids.map((id) =>
      () => this.getStorageDetails(id, reload, true)
    );

    try {
      const storageRecords = await batchResolve(storageFetchFunctions, 5);
      safeExec(this, () => {
        const storageRecordsProxies = storageRecords.map(r => promiseObject(resolve(r)));
        this.set('collectionCache.content', A(storageRecordsProxies));
        this.set('collectionCacheInitialized', true);
      });
      return this.collectionCache;
    } catch (error) {
      if (error && error.response && error.response.statusCode === 404) {
        safeExec(this, () => {
          this.set('collectionCache.content', A());
          this.set('collectionCacheInitialized', true);
        });
        return this.collectionCache;
      } else {
        throw error;
      }
    }
  },

  /**
   * Fetch collection of onepanel ClusterStorage
   *
   * @param {boolean} [reload=false] If true, force call to backend.
   * @returns {PromiseObject<Ember.ArrayProxy<Ember.ObjectProxy<Onepanel.StorageGetDetails>>>}
   */
  getStorages(reload = false) {
    return promiseObject(this.getStoragesPromise(reload));
  },

  /**
   * @param {string} id
   * @param {boolean} [reload=false] if true, force call to backend
   * @param {boolean} [batch=false] should be set to true, if `getStorageDetails` is
   *   launched in batch that would change `collectionCache`; otherwise it will try to
   *   add new record to existing `collectionCache` list
   * @returns {PromiseObject} resolves ClusterStorage ObjectProxy
   */
  getStorageDetails(id, reload = false, batch = false) {
    const {
      onepanelServer,
      _collectionMap,
      collectionCache,
    } = this.getProperties('onepanelServer', '_collectionMap', 'collectionCache');
    let record = _collectionMap[id];
    const promise = new Promise((resolve, reject) => {
      if (!reload && record != null && record.get('content') != null) {
        resolve(record);
      } else {
        const req = onepanelServer.requestValidData(
          'StoragesApi',
          'getStorageDetails',
          id
        );
        req.then(({ data }) => {
          record = _collectionMap[id] =
            (_collectionMap[id] || ObjectProxy.create({}));
          record.set('content', data);
          if (!batch) {
            const indexInCollection =
              collectionCache.toArray().findIndex(record => get(record, 'id') === id);
            if (indexInCollection > -1) {
              collectionCache[indexInCollection] = record;
            } else {
              collectionCache.pushObject(record);
            }
          }
          resolve(record);
        });
        req.catch(reject);
      }
    });
    return promiseObject(promise);
  },

  /**
   * @param {ClusterStorage} clusterStorage
   * @returns {Promise}
   */
  createStorage(clusterStorage) {
    const onepanelServer = this.get('onepanelServer');

    const createReqProto = {};
    createReqProto[clusterStorage.name] = clusterStorage;
    const createReq = StorageCreateRequest.constructFromObject(createReqProto);

    return onepanelServer.request('StoragesApi', 'addStorage', createReq);
  },

  /**
   * @param {string} id
   * @param {string} oldName not-modified version of storage name
   * @param {Onepanel.StorageModifyRequest} storageData
   * @returns {Promise} resolves when storage has been successfully modified
   */
  modifyStorage(id, oldName, storageData) {
    const onepanelServer = this.get('onepanelServer');

    const modifyRequestProto = {
      [oldName]: storageData,
    };
    const modifyRequest =
      StorageModifyRequest.constructFromObject(modifyRequestProto);

    return onepanelServer.request(
      'StoragesApi',
      'modifyStorage',
      id,
      modifyRequest
    );
  },

  /**
   * @param {string} id
   * @returns {Promise} resolves when storage has been successfully removed
   */
  removeStorage(id) {
    const onepanelServer = this.get('onepanelServer');
    return onepanelServer.request('StoragesApi', 'removeStorage', id);
  },
});
