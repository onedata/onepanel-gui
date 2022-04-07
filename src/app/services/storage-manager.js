/**
 * Provides backend model/operations for storages in onepanel
 *
 * @module services/storage-manager
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { A } from '@ember/array';

import ObjectProxy from '@ember/object/proxy';
import ArrayProxy from '@ember/array/proxy';
import { observer } from '@ember/object';
import { alias } from '@ember/object/computed';
import Service, { inject as service } from '@ember/service';
import { Promise } from 'rsvp';
import Onepanel from 'npm:onepanel';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import addConflictLabels from 'onedata-gui-common/utils/add-conflict-labels';

const {
  StorageCreateRequest,
  StorageModifyRequest,
} = Onepanel;

import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';

export default Service.extend({
  onepanelServer: service(),

  _collectionMap: undefined,

  collectionCache: undefined,

  /**
   * @type {Boolean}
   */
  collectionCacheInitialized: false,

  _collectionCache: alias('collectionCache.content'),

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

  /**
   * Fetch collection of onepanel ClusterStorage
   *
   * @param {boolean} [reload=false] if true, force call to backend
   * @returns {PromiseObject<Ember.ArrayProxy>} resolves ArrayProxy of SpaceDetails promise proxies
   */
  getStorages(reload = false) {
    const {
      onepanelServer,
      collectionCache,
      collectionCacheInitialized,
    } = this.getProperties(
      'onepanelServer',
      'collectionCache',
      'collectionCacheInitialized'
    );

    const promise = new Promise((resolve, reject) => {
      if (!reload && collectionCacheInitialized) {
        resolve(collectionCache);
      } else {
        const getStorages = onepanelServer.requestValidData(
          'StoragesApi',
          'getStorages'
        );

        getStorages.then(({ data: { ids } }) => {
          const storagesProxyArray = A(ids.map(id =>
            this.getStorageDetails(id, reload, true)));
          Promise.all(storagesProxyArray)
            .finally(() => safeExec(this, () => {
              this.set('collectionCache.content', storagesProxyArray);
              this.set('collectionCacheInitialized', true);
            }))
            .then(() => resolve(collectionCache))
            .catch(error => reject(error));
        });
        getStorages.catch(error => {
          if (error && error.response && error.response.statusCode === 404) {
            this.set('collectionCache.content', A());
            this.set('collectionCacheInitialized', true);
            resolve(collectionCache);
          } else {
            reject(error);
          }
        });
      }
    });

    return PromiseObject.create({ promise });
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
              collectionCache.toArray().findIndex(record => record.id === id);
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
    return PromiseObject.create({ promise });
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
