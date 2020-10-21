/**
 * Provides data and server methods for DNS management
 * 
 * @module mixins/components/dns-manager
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service from '@ember/service';
import { inject as service } from '@ember/service';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import { computed } from '@ember/object';

const dnsCheckKeys = ['domain', 'dnsZone'];

export default Service.extend(createDataProxyMixin('dnsCheck'), {
  onepanelServer: service(),

  dnsValid: computed('dnsCheck', function dnsValid() {
    const dnsCheck = this.get('dnsCheck');
    if (dnsCheck) {
      return dnsCheckKeys.every(key =>
        !dnsCheck[key] || dnsCheck[key].summary === 'ok'
      );
    }
  }),

  /**
   * @override
   */
  fetchDnsCheck({ forceCheck } = {}) {
    return this.get('onepanelServer')
      .request('DNSApi', 'checkDns', { forceCheck })
      .then(({ data }) => data);
  },
});
