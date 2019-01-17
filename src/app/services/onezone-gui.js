import Service, { inject as service } from '@ember/service';
import { resolve } from 'rsvp';
import { get, computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';

import config from 'ember-get-config';

const {
  APP: {
    MOCK_BACKEND,
  },
} = config;

const OnezoneGui = Service.extend(createDataProxyMixin('isOnezoneAvailable'), {
  onepanelServer: service(),
  providerManager: service(),
  onepanelConfiguration: service(),

  /**
   * @type {Ember.ComputedProperty<PromiseObject<string>>}
   */
  serviceTypeProxy: reads('onepanelServer.serviceTypeProxy'),

  // FIXME: also in provider mode using providerManager.getZoneInfo
  // /**
  //  * @type {Ember.ComputedProperty<string>}
  //  */
  // zoneDomain: computed('onepanelConfiguration.{serviceType,zoneDomain}', function zoneDomain() {

  // }),

  // FIXME: sorry...
  zoneDomain: 'dev-onezone.default.svc.cluster.local',

  // zoneDomain: reads('onepanelConfiguration.zoneDomain'),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  onezoneGuiUrl: computed('onezoneOrigin', function () {
    const onezoneOrigin = this.get('onezoneOrigin');
    return onezoneOrigin ? `${onezoneOrigin}/oz/onezone/i/#` : null;
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
    return `${onezoneOrigin}/oz/onezone/i/#/${path}`;
  },

  /**
   * Returns url to specified place in Onepanel hosted by onezone
   * @param {string} params.onepanelType one of: oneprovider, onezone
   * @param {string} params.clusterId
   * @param {string} [params.internalRoute='/'] Onezone application internal route
   * @param {boolean} [params.useRedirect=false] should be used redirect or direct url
   * @returns {string}
   */
  getOnepanelNavUrlInOnezone({
    onepanelType,
    clusterId,
    internalRoute = '/',
    useRedirect = false,
  } = {
    internalRoute: '/',
    useRedirect: false,
  }) {
    const onezoneOrigin = this.get('onezoneOrigin');
    if (!onepanelType) {
      onepanelType = this.get('onepanelConfiguration.serviceType');
    }
    if (!clusterId) {
      clusterId = this.get('onepanelConfiguration.clusterId');
    }

    const onepanelAbbrev = this.getOnepanelAbbrev(onepanelType);
    return useRedirect ?
      `${onezoneOrigin}/#?redirect=/${onepanelAbbrev}/${clusterId}/i#${internalRoute}` :
      `${onezoneOrigin}/${onepanelAbbrev}/${clusterId}/i#${internalRoute}`;
  },

  /**
   * Returns promise that resolves to true if onezone is available.
   * Check is performed by querying /configuration onezone endpoint.
   * @returns {Promise<boolean>}
   */
  fetchIsOnezoneAvailable() {
    const onepanelConfiguration = this.get('onepanelConfiguration');

    let canEnterViaOnezone;
    if (get(onepanelConfiguration, 'serviceType') === 'onezone') {
      canEnterViaOnezone = get(onepanelConfiguration, 'deployed');
    } else {
      canEnterViaOnezone = get(onepanelConfiguration, 'isRegistered');
    }

    return resolve(canEnterViaOnezone);
    // FIXME: it cannot work without CORS
    // const onezoneOrigin = this.get('onezoneOrigin');
    // if (onezoneOrigin) {
    //   return new Promise(resolve => {
    //     $.ajax(`${onezoneOrigin}/configuration`)
    //       .then(() => resolve(true), () => resolve(false));
    //   });
    // } else {
    //   return resolve(false);
    // }
  },
});

const OnezoneGuiMock = OnezoneGui.extend({
  /**
   * @override
   */
  fetchIsOnezoneAvailable() {
    return resolve(true);
  },

  /**
   * @override 
   */
  onezoneOrigin: computed(function onezoneOrigin() {
    return 'http://localhost:4201';
  }),
});

let ExportServer;
if (MOCK_BACKEND) {
  ExportServer = OnezoneGuiMock;
} else {
  ExportServer = OnezoneGui;
}

export default ExportServer;
