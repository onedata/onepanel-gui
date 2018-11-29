import Component from '@ember/component';
// import { computed } from '@ember/object';
// import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { resolve } from 'rsvp';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';

export default Component.extend(
  createDataProxyMixin('onezoneOrigin'),
  // FIXME: this will be probably injected if cluster manager will be refactored
  createDataProxyMixin('clusterId'), {
    onepanelServer: service(),

    cluster: undefined,

    // FIXME: implement real
    // clusterId: reads('cluster.id'),

    fetchClusterId() {
      return this.get('onepanelServer').getClusterId();
    },

    // FIXME: maybe make onezoneManager
    fetchOnezoneOrigin() {
      const onepanelServer = this.get('onepanelServer');

      if (onepanelServer.getClusterIdFromUrl()) {
        return resolve(location.origin.toString());
      } else {
        return onepanelServer.request('onepanel', 'getOnezoneInfo')
          .then(({ data: domain }) => `https://${domain}`);
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
