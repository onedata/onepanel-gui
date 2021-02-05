/**
 * Provides methods for getting and modifying web cert
 *
 * @module services/web-cert-manager
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { default as Service, inject as service } from '@ember/service';
import { computed, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import { reject, resolve } from 'rsvp';

export default Service.extend(createDataProxyMixin('webCert'), {
  onepanelServer: service(),
  guiUtils: service(),
  deploymentManager: service(),
  providerManager: service(),

  /**
   * @type {Location}
   */
  _location: location,

  /**
   * @type {ComputedProperty<String>}
   */
  onepanelServiceType: reads('guiUtils.serviceType'),

  /**
   * @type {ComputedProperty<Boolean>}
   */
  isEmergencyOnepanel: reads('onepanelServer.isEmergency'),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  webCertValid: computed('webCert.status', function webCertValid() {
    const webCert = this.get('webCert');
    return !webCert || get(webCert, 'status') === 'valid';
  }),

  /**
   * @returns {Promise<Onepanel.WebCert>}
   */
  fetchWebCert() {
    return this.get('onepanelServer').request('SecurityApi', 'getWebCert')
      .then(({ data: webCert }) => webCert);
  },

  /**
   * @param {boolean} letsEncrypt turn on/off letsEncrypt in service
   * @returns {Promise<undefined>} resolves when modification is successful
   */
  modifyWebCert({ letsEncrypt }) {
    return this.get('onepanelServer').request(
      'SecurityApi',
      'modifyWebCert', {
        letsEncrypt,
      }
    );
  },

  /**
   * @returns {Promise<String>}
   */
  getDomainForRedirectAfterWebCertChange() {
    const {
      onepanelServiceType,
      isEmergencyOnepanel,
      _location,
    } = this.getProperties('onepanelServiceType', 'isEmergencyOnepanel', '_location');

    if (isEmergencyOnepanel) {
      switch (onepanelServiceType) {
        case 'oneprovider':
          return this.get('providerManager').getProviderDetailsProxy()
            .then(provider => provider && get(provider, 'domain'));
        case 'onezone':
          return this.get('deploymentManager').getClusterConfiguration()
            .then(({ data: cluster }) => cluster && get(cluster, 'onezone.domainName'));
        default:
          return reject(`Invalid onepanelServiceType: ${onepanelServiceType}`);
      }
    } else {
      return resolve(_location.hostname);
    }
  },
});
