import Service, { inject as service } from '@ember/service';
import { resolve } from 'rsvp';
import { get, computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import checkImg from 'onedata-gui-common/utils/check-img';

export default Service.extend(
  createDataProxyMixin('isOnezoneAvailable'),
  createDataProxyMixin('canEnterViaOnezone'), {
    onepanelServer: service(),
    providerManager: service(),
    onepanelConfiguration: service(),

    /**
     * @type {Ember.ComputedProperty<PromiseObject<string>>}
     */
    serviceTypeProxy: reads('onepanelServer.serviceTypeProxy'),

    zoneDomain: reads('onepanelConfiguration.zoneDomain'),

    /**
     * @type {Ember.ComputedProperty<string>}
     */
    onezoneGuiUrl: computed('onezoneOrigin', function () {
      const onezoneOrigin = this.get('onezoneOrigin');
      return onezoneOrigin ? `${onezoneOrigin}/oz/onezone/i#` : null;
    }),

    /**
     * @type {Ember.ComputedProperty<string|null>}
     */
    onezoneOrigin: computed('zoneDomain', function onezoneOrigin() {
      const zoneDomain = this.get('zoneDomain');
      return zoneDomain ? 'https://' + this.get('zoneDomain') : null;
    }),

    clusterUrlInOnepanel: computed(
      'onezoneOrigin',
      'onepanelConfiguration.{serviceType,clusterId}',
      function clusterUrlInOnepanel() {
        return this.getOnepanelNavUrlInOnezone();
      }
    ),

    _location: location,

    /**
     * Returns abbreviation, that can be used to generate links to Onezone
     * @param {string} type one of: oneprovider, onezone
     * @returns {string}
     */
    getOnepanelAbbrev(type) {
      return type === 'onezone' ? 'ozp' : 'opp';
    },

    getUrlInOnezone(path) {
      const onezoneOrigin = this.get('onezoneOrigin');
      return `${onezoneOrigin}/oz/onezone/i#/${path}`;
    },

    /**
     * Returns url to specified place in Onepanel hosted by onezone
     * @param {string} onepanelType one of: oneprovider, onezone
     * @param {string} clusterId
     * @param {string} [internalRoute='/'] Onezone application internal route
     * @param {boolean} [redirectType='direct]
     * @returns {string}
     */
    getOnepanelNavUrlInOnezone({
      onepanelType,
      clusterId,
      internalRoute = '/',
      redirectType = 'direct',
    } = {
      internalRoute: '/',
      redirectType: 'onezone_route',
    }) {
      const onezoneOrigin = this.get('onezoneOrigin');
      if (!onepanelType) {
        onepanelType = this.get('onepanelConfiguration.serviceType');
      }
      if (!clusterId) {
        clusterId = this.get('onepanelConfiguration.clusterId');
      }

      const onepanelAbbrev = this.getOnepanelAbbrev(onepanelType);
      switch (redirectType) {
        case 'direct':
          return `${onezoneOrigin}/${onepanelAbbrev}/${clusterId}/i#${internalRoute}`;
        case 'redirect':
          sessionStorage.setItem(
            'redirectUrl',
            `/${onepanelAbbrev}/${clusterId}/i#${internalRoute}`
          );
          return onezoneOrigin;
        case 'onezone_route':
          // TODO: internal route support in onezone_route redirection
          return `${onezoneOrigin}/oz/onezone/i#/onedata/clusters/${clusterId}`;
        default:
          throw new Error(`service:onezone-gui Unsupported redirectType: ${redirectType}`);
      }
    },

    /**
     * Returns promise that resolves to true if Onezone is available.
     * @returns {Promise<boolean>}
     */
    fetchIsOnezoneAvailable() {
      const onezoneOrigin = this.get('onezoneOrigin');
      if (onezoneOrigin) {
        return checkImg(`${onezoneOrigin}/oz/onezone/favicon.ico`);
      } else {
        return resolve(false);
      }
    },

    fetchCanEnterViaOnezone() {
      const onepanelConfiguration = this.get('onepanelConfiguration');

      const isDeployed = get(
        onepanelConfiguration,
        (get(onepanelConfiguration, 'serviceType') === 'onezone') ?
        'deployed' : 'isRegistered'
      );

      return isDeployed ? this.getIsOnezoneAvailableProxy() : resolve(false);
    },
  });
