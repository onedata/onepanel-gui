/**
 * FIXME jsdoc
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
  assert,
  Service,
  ObjectProxy,
  PromiseProxyMixin,
  inject: { service },
  RSVP: { Promise },
} = Ember;

// FIXME
const {
  StorageCreateRequest,
} = Onepanel;

const ObjectPromiseProxy = ObjectProxy.extend(PromiseProxyMixin);

export default Service.extend({
  onepanelServer: service(),

  /**
   * Fetch collection of onepanel ClusterStorage
   * 
   * @param {string} id
   * @return {ObjectPromiseProxy} resolves Ember.Array of SpaceDetails promise proxies
   */
  getStorages() {
    let onepanelServer = this.get('onepanelServer');

    let promise = new Promise((resolve, reject) => {
      let getStorages = onepanelServer.request('oneprovider', 'getStorages');

      getStorages.then(({ data: { ids } }) => {
        resolve(A(ids.map(id => this.getStorageDetails(id))));
      });
      getStorages.catch(reject);
    });

    return ObjectPromiseProxy.create({ promise });
  },

  /**
   * FIXME doc
   * 
   * @param {string} id
   * @return {ObjectPromiseProxy} resolves ClusterStorage object
   */
  getStorageDetails(id) {
    assert('storage id cannot be null', id);
    let promise = new Promise((resolve, reject) => {
      let req = $.ajax({
        url: `/api/v3/onepanel/provider/storages/${id}`,
        method: 'GET',
      });
      req.done(data => resolve(data));
      req.fail((xhr, textStatus) => reject({ error: textStatus }));
    });
    // FIXME workaround for faulty API/Swagger
    // let onepanelServer = this.get('onepanelServer');
    // let promise = new Promise((resolve, reject) => {
    //   let req = onepanelServer.request('oneprovider', 'getStorageDetails', id);
    //   req.then(({ data }) => resolve(data));
    //   req.catch(reject);
    // });
    return ObjectPromiseProxy.create({ promise });
  },

  /**
   * FIXME doc
   * 
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
