import Service, { inject as service } from '@ember/service';
import { resolve } from 'rsvp';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import $ from 'jquery';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';

export default Service.extend(createDataProxyMixin('isOnezoneAvailable'), {
  onepanelServer: service(),
  providerManager: service(),
  onepanelConfiguration: service(),

  /**
   * @type {Ember.ComputedProperty<PromiseObject<string>>}
   */
  serviceTypeProxy: reads('onepanelServer.serviceTypeProxy'),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  onezoneDomain: reads('onepanelConfiguration.onezoneDomain'),

  /**
   * @type {Ember.ComputedProperty<string|null>}
   */
  onezoneOrigin: computed('onezoneDomain', function onezoneOrigin() {
    const onezoneDomain = this.get('onezoneDomain');
    return onezoneDomain ? 'https://' + this.get('onezoneDomain') : null;
  }),

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
        // FIXME add fetching onezone origin using new (probably configuration)
        // request, that doesn't need authorization. Needs backend.
        // Should return null if provider is not registered in zone (because it
        // is not an error)
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

  /**
   * Returns abbreviation, that can be used to generate links to Onezone
   * @param {string} type one of: oneprovider, onezone
   * @returns {string}
   */
  getOnepanelAbbrev(type) {
    return type === 'onezone' ? 'ozp' : 'opp';
  },

  /**
   * Returns url to specified place in onepanel hosted by onezone
   * @param {string} onepanelType one of: oneprovider, onezone
   * @param {string} clusterId
   * @param {string} [internalRoute='/'] onezone application internal route
   * @returns {string}
   */
  getOnepanelNavUrlInOnezone(onepanelType, clusterId, internalRoute = '/') {
    const onezoneOrigin = this.get('onezoneOrigin');
    const onepanelAbbrev = this.getOnepanelAbbrev(onepanelType);
    return `${onezoneOrigin}/${onepanelAbbrev}/${clusterId}/i#${internalRoute}`;
  },

  /**
   * Returns promise that resolves to true if onezone is available.
   * Check is performed by querying /configuration onezone endpoint.
   * @returns {Promise<boolean>}
   */
  fetchIsOnezoneAvailable() {
    const onezoneOrigin = this.get('onezoneOrigin');
    if (onezoneOrigin) {
      return new Promise(resolve => {
        $.ajax(`${onezoneOrigin}/configuration`)
          .then(() => resolve(true), () => resolve(false));
      });
    } else {
      return resolve(false);
    }
  },
});
