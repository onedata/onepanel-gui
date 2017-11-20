/**
 * Provides backend model/operations for storages in onepanel
 *
 * @module services/storage-manager
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import Onepanel from 'npm:onepanel';

const {
  A,
  Service,
  ObjectProxy,
  ArrayProxy,
  computed: { alias },
  inject: { service },
  RSVP: { Promise },
} = Ember;

const {
  StorageCreateRequest,
} = Onepanel;

import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';

export default Service.extend({
  onepanelServer: service(),

  _collectionMap: {},

  collectionCache: ArrayProxy.create({ content: null }),
  _collectionCache: alias('collectionCache.content'),

  /**
   * Fetch collection of onepanel ClusterStorage
   * 
   * @param {boolean} [reload=false] if true, force call to backend
   * @return {PromiseObject<Ember.ArrayProxy>} resolves ArrayProxy of SpaceDetails promise proxies
   */
  getStorages(reload = false) {
    let onepanelServer = this.get('onepanelServer');
    let collectionCache = this.get('collectionCache');

    let promise = new Promise((resolve, reject) => {
      if (!reload && collectionCache.get('content') != null) {
        resolve(collectionCache);
      } else {
        let getStorages = onepanelServer.requestValidData(
          'oneprovider',
          'getStorages'
        );

        getStorages.then(({ data: { ids } }) => {
          this.set('collectionCache.content', A(ids.map(id =>
            this.getStorageDetails(id))));
          resolve(collectionCache);
        });
        getStorages.catch(error => {
          if (error && error.response && error.response.statusCode === 404) {
            this.set('collectionCache.content', A());
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
   * @returns {PromiseObject} resolves ClusterStorage ObjectProxy
   */
  getStorageDetails(id, reload = false) {
    let onepanelServer = this.get('onepanelServer');
    let _collectionMap = this.get('_collectionMap');
    let record = _collectionMap[id];
    let promise = new Promise((resolve, reject) => {
      if (!reload && record != null && record.get('content') != null) {
        resolve(record);
      } else {
        let req = onepanelServer.requestValidData(
          'oneprovider',
          'getStorageDetails',
          id
        );
        req.then(({ data }) => {
          record = _collectionMap[id] = (_collectionMap[id] || ObjectProxy.create({}));
          record.set('content', data);
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
    let onepanelServer = this.get('onepanelServer');

    let createReqProto = {};
    createReqProto[clusterStorage.name] = clusterStorage;
    let createReq = StorageCreateRequest.constructFromObject(createReqProto);

    return onepanelServer.request('oneprovider', 'addStorage', createReq);
  },
});
