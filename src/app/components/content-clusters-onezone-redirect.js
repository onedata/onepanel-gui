import Component from '@ember/component';
// import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { resolve } from 'rsvp';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';

export default Component.extend(
  createDataProxyMixin('onezoneOrigin'),
  // FIXME: this will be probably injected if cluster manager will be refactored
  createDataProxyMixin('clusterId'), {
    onepanelServer: service(),

    cluster: undefined,

    serviceTypeProxy: reads('onepanelServer.serviceTypeProxy'),

    fetchClusterId() {
      return this.get('onepanelServer').getClusterId();
    },

    // FIXME: maybe make onezoneManager
    /**
     * @returns {Promise<string>}
     */
    fetchOnezoneOrigin() {
      const onepanelServer = this.get('onepanelServer');
      if (onepanelServer.getClusterIdFromUrl()) {
        return resolve(location.origin.toString());
      } else {
        return this.get('serviceTypeProxy').then(serviceType => {
          if (serviceType === 'provider') {
            // return onepanelServer.request('oneprovider', 'getOnezoneInfo')
            //   .then(({ data: { domain } }) => `https://${domain}`);

            // FIXME: temporary, use version above
            return onepanelServer.request('oneprovider', 'getProvider')
              .then(({ data }) => `https://${data.onezoneDomainName}`);
          } else {
            // FIXME: to refactor when configuration manager will be avail
            return onepanelServer.request('onezone', 'getZoneConfiguration')
              .then(({ data }) => `https://${data.onezone.domainName}`);
          }
        });
      }
    },

    init() {
      this._super(...arguments);
      this.redirectToOnezone();
    },

    redirectToOnezone() {
      return this.getClusterIdProxy().then(clusterId => {
        return this.getOnezoneOriginProxy().then(onezoneOrigin => {
          window.location =
            `${onezoneOrigin}/oz/onezone/i#/onedata/clusters/${clusterId}`;
        });
      });

    },
  });
