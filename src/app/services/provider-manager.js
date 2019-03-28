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

const {
  ProviderModifyRequest,
} = Onepanel;

export default Service.extend(createDataProxyMixin('providerDetails'), {
  onepanelServer: service(),
  deploymentManager: service(),

  /**
   * @override
   * @param {boolean} [reload] if true, forces to make a request regardless of ``providerCache``
   * @returns {Onepanel.ProviderDetails} ProviderDetails or null if not available;
   *  rejects on non-404 request errors
   */
  fetchProviderDetails() {
    let onepanelServer = this.get('onepanelServer');
    return onepanelServer.requestValidData('oneprovider', 'getProvider')
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
        'oneprovider',
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
    let deregistering = onepanelServer.request('oneprovider', 'removeProvider');
    deregistering.then(() => deploymentManager
      .getInstallationDetailsProxy({ reload: true }));
    return deregistering;
  },

  getRemoteProvider(id) {
    return this.get('onepanelServer').request('onepanel', 'getRemoteProvider', id)
      .then(({ data }) => data);
  },

  getOnezoneInfo() {
    return this.get('onepanelServer').request('oneprovider', 'getOnezoneInfo', {})
      .then(({ data }) => data);
  },
});
