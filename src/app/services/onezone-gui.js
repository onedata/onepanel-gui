import Service, { inject as service } from '@ember/service';
import { resolve } from 'rsvp';
import { reads } from '@ember/object/computed';

export default Service.extend({
  onepanelServer: service(),
  providerManager: service(),

  serviceTypeProxy: reads('onepanelServer.serviceTypeProxy'),

  _location: location,

  /**
   * @returns {Promise<string>}
   */
  fetchOnezoneOrigin() {
    const onepanelServer = this.get('onepanelServer');
    if (onepanelServer.getClusterIdFromUrl()) {
      return resolve(this.get('_location').origin.toString());
    } else {
      return this.get('serviceTypeProxy').then(serviceType => {
        if (serviceType === 'provider') {
          return this.get('providerManager').getProviderDetails()
            .then(data => `https://${data.onezoneDomainName}`);
          // FIXME: old, deprecated code
          // return onepanelServer.request('oneprovider', 'getProvider')
          //   .then(({ data }) => `https://${data.onezoneDomainName}`);
        } else {
          // FIXME: to refactor when configuration manager will be avail
          return onepanelServer.request('onezone', 'getZoneConfiguration')
            .then(({ data }) => `https://${data.onezone.domainName}`);
        }
      });
    }
  },
});
