/**
 * Provides data for routes and components assoctiated with provider of cluster
 *
 * @module services/provider-manager
 * @author Jakub Liput
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import Onepanel from 'npm:onepanel';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import { resolve } from 'rsvp';

const {
  ProviderModifyRequest,
} = Onepanel;

export default Service.extend(createDataProxyMixin('providerDetails'), {
  onepanelServer: service(),
  deploymentManager: service(),

  /**
   * Contains mapping `providerId -> provider` of already fetched providers.
   * Initialized on service init.
   * @type {Object}
   */
  providersDetailsCache: undefined,

  init() {
    this._super(...arguments);
    this.set('providersDetailsCache', {});
  },

  /**
   * @override
   * @param {boolean} [reload] if true, forces to make a request regardless of ``providerCache``
   * @returns {Onepanel.ProviderDetails} ProviderDetails or null if not available;
   *  rejects on non-404 request errors
   */
  fetchProviderDetails() {
    let onepanelServer = this.get('onepanelServer');
    return onepanelServer.requestValidData('OneproviderIdentityApi', 'getProvider')
      .then(({ data }) => data)
      .catch(error => {
        if (error && error.response && error.response.statusCode === 404) {
          null;
        } else {
          throw error;
        }
      });
  },

  /**
   * Change registered provider data - see `modifyProvider` of Onepanel lib
   * @param {Onepanel.ProviderModifyRequest} providerData
   * @returns {Promise} onepanel.modifyProvider request promise
   */
  modifyProvider(providerData) {
    let {
      onepanelServer,
      deploymentManager,
    } = this.getProperties('onepanelServer', 'deploymentManager');
    let providerModifyRequest = ProviderModifyRequest.constructFromObject(providerData);
    return onepanelServer.request(
        'OneproviderIdentityApi',
        'modifyProvider',
        providerModifyRequest
      )
      .then(() => this.getProviderDetailsProxy({ reload: true }))
      .then(() => deploymentManager.getInstallationDetailsProxy({ reload: true }));
  },

  /**
   * Deregisters provider using API
   * @returns {Promise} API operation promise
   */
  deregisterProvider() {
    let {
      onepanelServer,
      deploymentManager,
    } = this.getProperties('onepanelServer', 'deploymentManager');
    let deregistering = onepanelServer.request(
      'OneproviderIdentityApi',
      'removeProvider'
    );
    deregistering.then(() => deploymentManager
      .getInstallationDetailsProxy({ reload: true }));
    return deregistering;
  },

  getRemoteProvider(id) {
    const providersDetailsCache = this.get('providersDetailsCache');
    const detailsCache = providersDetailsCache[id];
    if (detailsCache) {
      return resolve(detailsCache);
    } else {
      return this.get('onepanelServer').request('InternalApi', 'getRemoteProvider', id)
        .then(({ data }) => {
          providersDetailsCache[id] = data;
          return data;
        });
    }
  },

  getOnezoneInfo() {
    return this.get('onepanelServer').request(
        'OneproviderIdentityApi',
        'getOnezoneInfo', {}
      )
      .then(({ data }) => data);
  },
});
