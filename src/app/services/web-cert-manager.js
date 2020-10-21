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
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';

export default Service.extend(createDataProxyMixin('webCert'), {
  onepanelServer: service(),

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
});
