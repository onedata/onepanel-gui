// TODO: VFS-9257 fix eslint issues in this file
/* eslint-disable no-param-reassign */

/**
 * Provides information and methods for this app to cooperate with
 * Onezone GUI app hosted on the same domain.
 *
 * @module services/onezone-gui
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import { resolve } from 'rsvp';
import { get, computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import checkImg from 'onedata-gui-common/utils/check-img';
import {
  onepanelAbbrev,
  onezoneTestImagePath,
  getOnezoneUrl,
} from 'onedata-gui-common/utils/onedata-urls';

export default Service.extend(
  createDataProxyMixin('isOnezoneAvailable'),
  createDataProxyMixin('canEnterViaOnezone'), {
    onepanelServer: service(),
    providerManager: service(),
    onepanelConfiguration: service(),

    _location: location,

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
      return onezoneOrigin ?
        getOnezoneUrl(onezoneOrigin) : null;
    }),

    /**
     * @type {Ember.ComputedProperty<string|null>}
     */
    onezoneOrigin: computed('zoneDomain', function onezoneOrigin() {
      const zoneDomain = this.get('zoneDomain');
      return zoneDomain ? 'https://' + zoneDomain : null;
    }),

    /**
     * URL of Onezone main view.
     * For other Onezone views/redirections use `getOnepanelNavUrlInOnezone`
     * method.
     * @type {Ember.ComputedProperty<string>}
     */
    clusterUrlInOnepanel: computed(
      'onezoneOrigin',
      'onepanelConfiguration.{serviceType,clusterId}',
      function clusterUrlInOnepanel() {
        return this.getOnepanelNavUrlInOnezone();
      }
    ),

    getUrlInOnezone(path) {
      return getOnezoneUrl(this.get('onezoneOrigin'), path);
    },

    /**
     * Returns url to specified place in Onepanel hosted by Onezone.
     * @param {string} [clusterId] If not provided, use this Onepanel cluster ID.
     * @param {string} [internalRoute='/'] Onezone application internal route.
     * @param {'direct'|'redirect'|'onezone_route'} [redirectType='direct']
     * @returns {string}
     */
    getOnepanelNavUrlInOnezone({
      clusterId,
      internalRoute = '/',
      redirectType = 'direct',
    } = {
      internalRoute: '/',
      redirectType: 'onezone_route',
    }) {
      const onezoneOrigin = this.get('onezoneOrigin');
      if (!clusterId) {
        clusterId = this.get('onepanelConfiguration.clusterId');
      }

      switch (redirectType) {
        case 'direct':
          return getOnezoneUrl(onezoneOrigin, internalRoute);
        case 'redirect':
          if (get('onepanelServer', 'isEmergency')) {
            throw new Error(
              'service:onezone-gui#getOnepanelNavUrlInOnezone: tried to use redirect on emergency Onepanel which is currently not supported'
            );
          }
          return getOnezoneUrl(
            onezoneOrigin,
            // NOTE: "#"" is encoded to %23 to be handled by transition query params
            `/?redirect_url=/${onepanelAbbrev}/${clusterId}/i%23${internalRoute}`
          );
        case 'onezone_route':
          return getOnezoneUrl(onezoneOrigin, `onedata/clusters/${clusterId}`);
        default:
          throw new Error(
            `service: onezone-gui Unsupported redirectType: ${redirectType}`
          );
      }
    },

    /**
     * Returns promise that resolves to true if Onezone is available.
     * @returns {Promise<boolean>}
     */
    fetchIsOnezoneAvailable() {
      const onezoneOrigin = this.get('onezoneOrigin');
      if (onezoneOrigin) {
        return checkImg(
          `${onezoneOrigin}${onezoneTestImagePath}`);
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
