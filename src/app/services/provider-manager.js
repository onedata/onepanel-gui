/**
 * Provides data for routes and components assoctiated with provider of cluster
 *
 * @module services/provider-manager
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject from '@ember/object';

import Service, { inject as service } from '@ember/service';
import ObjectProxy from '@ember/object/proxy';
import { Promise } from 'rsvp';
import { alias } from '@ember/object/computed';
import Onepanel from 'npm:onepanel';

const {
  ProviderModifyRequest,
} = Onepanel;

import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';

export default Service.extend({
  onepanelServer: service(),
  clusterManager: service(),

  providerCache: ObjectProxy.create({ content: null }),
  _providerCache: alias('providerCache.content'),

  /**
   * @param {boolean} [reload] if true, forces to make a request regardless of ``providerCache``
   * @returns {PromiseProxy} resolves with ProviderDetails or null if not available;
   *  rejects on non-404 request errors
   */
  getProviderDetails(reload) {
    let onepanelServer = this.get('onepanelServer');
    let providerCache = this.get('providerCache');
    let gettingProvider = onepanelServer.requestValidData('oneprovider', 'getProvider');
    let promise = new Promise((resolve, reject) => {
      if (!reload && this.get('_providerCache')) {
        resolve(providerCache);
      } else {
        gettingProvider.then(({ data: provider }) => {
          let newProviderCache = EmberObject.create(provider);
          this.set('_providerCache', newProviderCache);
          return resolve(providerCache);
        });
        gettingProvider.catch(error => {
          if (error && error.response && error.response.statusCode === 404) {
            resolve(null);
          } else {
            reject(error);
          }
        });
      }
    });
    return PromiseObject.create({ promise });
  },

  /**
   * Change registered provider data - see `modifyProvider` of Onepanel lib
   * @param {Onepanel.ProviderModifyRequest} providerData
   * @returns {Promise} onepanel.modifyProvider request promise
   */
  modifyProvider(providerData) {
    let {
      onepanelServer,
      clusterManager,
    } = this.getProperties('onepanelServer', 'clusterManager');
    let providerModifyRequest = ProviderModifyRequest.constructFromObject(providerData);
    let modifying = onepanelServer.request(
      'oneprovider',
      'modifyProvider',
      providerModifyRequest
    );
    modifying.then(() => {
      clusterManager.getDefaultRecord(true);
    });
    return modifying;
  },

  /**
   * Deregisters provider using API
   * @returns {Promise} API operation promise
   */
  deregisterProvider() {
    let {
      onepanelServer,
      clusterManager,
    } = this.getProperties('onepanelServer', 'clusterManager');
    let deregistering = onepanelServer.request('oneprovider', 'removeProvider');
    deregistering.then(() => clusterManager.getDefaultRecord(true));
    return deregistering;
  },
});
