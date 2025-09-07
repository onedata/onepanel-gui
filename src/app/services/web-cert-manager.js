/**
 * Provides methods for getting and modifying web cert
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2018-2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import {
  default as Service,
  inject as service,
} from '@ember/service';
import { computed, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import { reject, resolve } from 'rsvp';
import config from 'ember-get-config';
import changeDomain from 'onepanel-gui/utils/change-domain';
import globals from 'onedata-gui-common/utils/globals';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import domainMatches from 'onepanel-gui/utils/domain-matches';

const {
  time: {
    reloadDelayForCertificateChange,
  },
} = config;

/**
 * @typedef {Object} Onepanel.WebCert
 * See: https://github.com/onedata/onepanel-javascript-client/blob/develop/docs/WebCert.md
 * for used version of onepanel-javascript-client npm package.
 */

export default Service.extend(createDataProxyMixin('webCert'), {
  onepanelServer: service(),
  guiUtils: service(),
  deploymentManager: service(),
  providerManager: service(),
  clusterModelManager: service(),

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
  webCertValid: computed(
    'webCert.status',
    'isS3DomainValidProxy.content',
    function webCertValid() {
      const { webCert } = this;
      const isS3DomainValid = this.isS3DomainValidProxy.content;
      return !webCert || (
        webCert.status === 'valid' &&
        this.isWebCertDomainValid(webCert) &&
        isS3DomainValid !== false
      );
    }
  ),

  /**
   * Checks if there is `s3.` domain included in domains if S3 is enabled.
   * If there is no S3 in the cluster, it is considered as valid.
   * @type {ComputedProperty<PromiseObject<boolean>>}
   */
  isS3DomainValidProxy: computed(
    'webCertProxy.content',
    'onepanelServiceType',
    function isS3DomainValidProxy() {
      const resolver = async () => {
        if (this.onepanelServiceType === 'onezone') {
          return true;
        }
        const { clusterHostsInfo } = await this.deploymentManager.getClusterHostsInfo();
        const isS3Enabled = clusterHostsInfo.some(host => host.oneS3);
        if (!isS3Enabled) {
          return true;
        }
        const webCert = await this.webCertProxy;
        return webCert.dnsNames.some(dnsName => dnsName.startsWith('s3.'));
      };
      return promiseObject(resolver());
    }
  ),

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
   * @returns {Promise}
   */
  reloadPageAfterWebCertChange() {
    return this.getDomainForRedirectAfterWebCertChange()
      .then(domain => changeDomain(domain, {
        delay: reloadDelayForCertificateChange,
      }));
  },

  /**
   * @returns {Promise<String>}
   */
  getDomainForRedirectAfterWebCertChange() {
    const {
      onepanelServiceType,
      isEmergencyOnepanel,
    } = this.getProperties('onepanelServiceType', 'isEmergencyOnepanel');

    if (isEmergencyOnepanel || onepanelServiceType === 'onezone') {
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
      return resolve(globals.location.hostname);
    }
  },

  /**
   * Checks if domain for the service is included in the web cert DNS names.
   * @param {Onepanel.WebCert} webCert
   * @returns {boolean}
   */
  isWebCertDomainValid(webCert) {
    const serviceDomain = this.guiUtils.serviceDomain;
    if (!webCert || !serviceDomain) {
      return false;
    }
    return webCert.dnsNames.some(dnsName => domainMatches(serviceDomain, dnsName));
  },
});
