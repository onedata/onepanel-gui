/**
 * Unified interface for fetching service domain name for Onezone and Oneprovider
 * 
 * @module mixins/domain-name-proxy
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Mixin from '@ember/object/mixin';
import { get } from '@ember/object';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';

export default Mixin.create(createDataProxyMixin('domain'), {
  /**
   * Resolves with domain name of the service
   * @returns {Promise<string>}
   */
  fetchDomain() {
    const onepanelServiceType = this.get('onepanelServiceType');
    let promise;
    if (onepanelServiceType === 'provider') {
      promise = this.get('providerManager').getProviderDetails(true)
        .then(provider => get(provider, 'domain'));
    } else if (onepanelServiceType === 'zone') {
      promise = this.get('configurationManager').getDefaultRecord(true)
        .then(cluster => get(
          cluster,
          `clusterInfo.one${onepanelServiceType}.domainName`
        ));
    }
    return promise;
  },
});
