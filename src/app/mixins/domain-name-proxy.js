/**
 * Unified interface for fetching service domain name for Onezone and Oneprovider
 * 
 * @module mixins/domain-name-proxy
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Mixin from '@ember/object/mixin';
import { computed, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';

export default Mixin.create({
  domain: reads('domainProxy.content'),

  /**
   * @type {PromiseObject<string>}
   * Resolves with domain name of the service
   */
  domainProxy: computed('onepanelServiceType', function domainProxy() {
    const onepanelServiceType = this.get('onepanelServiceType');
    let promise;
    if (onepanelServiceType === 'provider') {
      promise = this.get('providerManager').getProviderDetails()
        .then(provider => get(provider, 'domain'));
    } else if (onepanelServiceType === 'zone') {
      promise = this.get('clusterManager').getDefaultRecord()
        .then(cluster => get(
          cluster,
          `clusterInfo.one${onepanelServiceType}.domainName`
        ));
    }
    return promise && PromiseObject.create({ promise });
  }),
});
