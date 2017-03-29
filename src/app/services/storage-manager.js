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
  Service,
  ObjectProxy,
  PromiseProxyMixin,
  inject: { service },
  RSVP: { Promise },
} = Ember;

// FIXME
const {
  ClusterStoragesList,
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
    // FIXME using custom AJAX for spaces
    // let onepanelServer = this.get('onepanelServer');

    let promise = new Promise((resolve, reject) => {
      // let getSpaces = onepanelServer.request('oneprovider', 'getProviderSpaces');

      let pro = $.ajax({
        method: 'GET',
        url: '/api/v3/onepanel/provider/storages',
      });

      // FIXME future      
      let getStorages = new Promise((resolveList) => {
        pro.done(storages => {
          // FIXME ensure polyfills for IE/Edge - but this is for future, so will be removed anyway
          let futureStorages = Object.keys(storages).map(id =>
            Object.assign({ name: id }, storages[id])
          );
          resolveList(futureStorages);
        });
      });

      getStorages.then(({ ids }) => {
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
    let onepanelServer = this.get('onepanelServer');
    let promise = onepanelServer.request('oneprovider', 'getStorageDetails', id);
    return ObjectPromiseProxy.create({ promise });
  },

  /**
   * FIXME doc
   * 
   * @param {object} formData contains attributes for specific storage type as in REST API
   * @param {object} formData.type required attribute for storage
   * @param {object} formData.name required attribute for storage
   * @returns {Promise}
   */
  createStorage(clusterStorage) {
    let onepanelServer = this.get('onepanelServer');

    let csListProto = {};
    // FIXME for now: fake name field
    csListProto[clusterStorage.name] = clusterStorage;

    let csList = ClusterStoragesList.constructFromObject(csListProto);

    return onepanelServer.request('oneprovider', 'addStorage', csList);
  },
});
