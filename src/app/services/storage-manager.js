/**
 * Provides backend model/operations for storages in onepanel
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import ObjectProxy from '@ember/object/proxy';
import { observer, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import Service, { inject as service } from '@ember/service';
import { Promise } from 'rsvp';
import Onepanel from 'onepanel';
import addConflictLabels from 'onedata-gui-common/utils/add-conflict-labels';
import PromiseObject, { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import BatchResolver from 'onedata-gui-common/utils/batch-resolver';
import createClusterStorageModel from 'ember-onedata-onepanel-server/utils/create-cluster-storage-model';

const {
  StorageCreateRequest,
  StorageModifyRequest,
} = Onepanel;

export default Service.extend({
  onepanelServer: service(),

  _collectionMap: undefined,

  /**
   * @type {PromiseObject<Utils.BatchResolver>}
   */
  storagesBatchResolverCache: undefined,

  /**
   * @type {PromiseObject<Utils.BatchResolver>}
   */
  spacesBatchResolverCache: undefined,

  collectionCache: reads('storagesBatchResolverCache.promiseObject'),

  conflictNameObserver: observer(
    'collectionCache.content.@each.name',
    function conflictNameObserver() {
      if (!this.collectionCache?.content) {
        return;
      }
      addConflictLabels(
        this.get('collectionCache.content').filterBy('content').mapBy('content'),
        'name',
        'id'
      );
    }
  ),

  init() {
    this._super(...arguments);
    this.setProperties({
      storagesBatchResolverCache: PromiseObject.create(),
      spacesBatchResolverCache: PromiseObject.create(),
      _collectionMap: {},
    });
  },

  async getStoragesIds() {
    return (await this.onepanelServer.requestValidData(
      'StoragesApi',
      'getStorages'
    ))?.data?.ids ?? [];
  },

  /**
   * @param {boolean} [reload]
   * @returns {PromiseObject<Utils.BatchResolver>}
   */
  getStoragesBatchResolver(reload = true) {
    let batchResolverPromise;
    if (reload || !get(this.storagesBatchResolverCache, 'content')) {
      batchResolverPromise = this._resolveStoragesBatchResolver();
      this.storagesBatchResolverCache.set('promise', batchResolverPromise);
    }
    return this.storagesBatchResolverCache;
  },

  async _resolveStoragesBatchResolver() {
    const ids = await this.getStoragesIds();
    const storageFetchFunctions = ids.map((id) =>
      async () => {
        try {
          return await this.getStorageDetails(id, true, true);
        } catch (error) {
          return ObjectProxy.create({
            isRejected: true,
          });
        }
      }
    );
    const batchResolver = BatchResolver.create({
      promiseFunctions: storageFetchFunctions,
      chunkSize: 20,
    });
    batchResolver.allFulfilled();
    return batchResolver;
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
    let record = this._collectionMap[id];
    const promise = new Promise((resolve, reject) => {
      if (!reload && record != null && record.get('content') != null) {
        resolve(record);
      } else {
        const req = this.onepanelServer.requestValidData(
          'StoragesApi',
          'getStorageDetails',
          id
        );
        req.then(({ data }) => {
          record = this._collectionMap[id] =
            (this._collectionMap[id] || ObjectProxy.create({}));
          record.set('content', data);
          if (!batch && this.collectionCache) {
            const indexInCollection =
              this.collectionCache.content.toArray().findIndex(record =>
                get(record, 'id') === id
              );
            if (indexInCollection > -1) {
              this.collectionCache.content[indexInCollection] = record;
            } else {
              this.collectionCache.content.pushObject(record);
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
   * @param {Onepanel.StorageModifyRequest} storageData
   * @returns {Promise<{ verificationPassed: boolean }>} resolves when storage
   * has been successfully modified
   */
  async modifyStorage(id, storageData) {
    const storageBeforeModification = (await this.getStorageDetails(id)).content;
    const {
      name: storageOldName,
      type: storageType,
    } = storageBeforeModification;

    const storageModelUpdate = createClusterStorageModel({
      ...storageData,
      type: storageType,
    }, true);
    const modifyRequestProto = {
      [storageOldName]: storageModelUpdate,
    };
    const modifyRequest =
      StorageModifyRequest.constructFromObject(modifyRequestProto);

    const result = await this.onepanelServer.request(
      'StoragesApi',
      'modifyStorage',
      id,
      modifyRequest
    );

    // Reload current storage details if were fetched earlier.
    if (this._collectionMap[id]) {
      await this.getStorageDetails(id, true);
    }

    return {
      verificationPassed: result?.data?.verificationPassed ?? false,
    };
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
