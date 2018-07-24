/**
 * Provides methods for getting and modifying web cert
 *
 * @module services/web-cert-manager
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { default as Service, inject as service } from '@ember/service';

export default Service.extend({
  onepanelServer: service(),

  /**
   * @returns {Promise<Onepanel.WebCert>}
   */
  getWebCert() {
    return this.get('onepanelServer').request('onepanel', 'getWebCert')
      .then(({ data: webCert }) => webCert);
  },

  /**
   * @param {boolean} letsEncrypt turn on/off letsEncrypt in service
   * @returns {Promise<undefined>} resolves when modification is successful
   */
  modifyWebCert({ letsEncrypt }) {
    return this.get('onepanelServer').request('onepanel', 'modifyWebCert', {
      letsEncrypt,
    });
  },
});
