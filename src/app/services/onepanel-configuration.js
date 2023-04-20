/**
 * Provides information available at /configuration endpoint.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import { get } from '@ember/object';
import { reads } from '@ember/object/computed';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import globals from 'onedata-gui-common/utils/globals';

export default Service.extend(
  createDataProxyMixin('configuration'), {
    onepanelServer: service(),

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
    providerDomain: reads('configurationProxy.providerDomain'),

    /**
     * Oneprovider field.
     * @type {Ember.ComputedProperty<string>}
     */
    providerName: reads('configurationProxy.providerName'),

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

      // Fill some already known data if Onepanel is hosted
      const isHosted = (get(this.onepanelServer, 'guiContext.guiMode') === 'unified');
      if (isHosted) {
        this.setProperties({
          zoneDomain: globals.location.host,
          serviceType: get(this.onepanelServer, 'guiContext.clusterType'),
          clusterId: get(this.onepanelServer, 'guiContext.clusterId'),
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
