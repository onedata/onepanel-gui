/**
 * Provides information available at /configuration endpoint.
 *
 * @module services/onepanel-configuration
 * @author Michal Borzecki
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';

export default Service.extend(
  createDataProxyMixin('configuration'), {
    onepanelServer: service(),

    /**
     * @type {Window.Location}
     */
    _location: location,

    /**
     * Common field.
     * Can be set to value from URL on init.
     * @type {Ember.ComputedProperty<string>}
     */
    clusterId: reads('configurationProxy.clusterId'),

    /**
     * Common field.
     * @type {Ember.ComputedProperty<string>}
     */
    version: reads('configurationProxy.version'),

    /**
     * Common field.
     * @type {Ember.ComputedProperty<string>}
     */
    build: reads('configurationProxy.build'),

    /**
     * Common field.
     * @type {Ember.ComputedProperty<boolean>}
     */
    deployed: reads('configurationProxy.deployed'),

    /**
     * Common field.
     * Can be set to value from URL on init.
     * One of: oneprovider, onezone
     * @type {Ember.ComputedProperty<string>}
     */
    serviceType: reads('configurationProxy.serviceType'),

    /**
     * Common field.
     * @type {Ember.ComputedProperty<string>}
     */
    zoneDomain: reads('configurationProxy.zoneDomain'),

    /**
     * Onezone field.
     * Can be set to value from URL on init.
     * @type {Ember.ComputedProperty<string>}
     */
    zoneName: reads('configurationProxy.zoneName'),

    /**
     * Oneprovider field.
     * @type {Ember.ComputedProperty<string>}
     */
    providerId: reads('configurationProxy.providerId'),

    /**
     * Oneprovider field.
     * Can be set to value from URL on init.
     * @type {Ember.ComputedProperty<boolean>}
     */
    isRegistered: reads('configurationProxy.isRegistered'),

    init() {
      this._super(...arguments);

      const {
        onepanelServer,
        _location,
      } = this.getProperties('onepanelServer', '_location');

      // Fill some already known data if Onepanel is hosted
      const clusterIdFromUrl = onepanelServer.getClusterIdFromUrl();
      if (clusterIdFromUrl) {
        this.setProperties({
          zoneDomain: _location.host,
          serviceType: onepanelServer.getClusterTypeFromUrl(),
          clusterId: clusterIdFromUrl,
          isRegistered: true,
        });
      }
    },

    /**
     * @override
     * Fetches configuration
     * @returns {Promise<Object>}
     */
    fetchConfiguration() {
      return this.get('onepanelServer').getConfigurationProxy();
    },
  });
