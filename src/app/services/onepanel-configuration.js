/**
 * Provides information available at /configuration endpoint.
 *
 * @module services/onepanel-configuration
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';

export default Service.extend(createDataProxyMixin('configuration'), {
  onepanelServer: service(),

  /**
   * @type {Window.Location}
   */
  _location: location,

  /**
   * Common
   * @type {Ember.ComputedProperty<string>}
   */
  clusterId: reads('configurationProxy.clusterId'),

  /**
   * Common
   * @type {Ember.ComputedProperty<string>}
   */
  version: reads('configurationProxy.version'),

  /**
   * Common
   * @type {Ember.ComputedProperty<string>}
   */
  build: reads('configurationProxy.build'),

  /**
   * Common
   * @type {Ember.ComputedProperty<boolean>}
   */
  deployed: reads('configurationProxy.deployed'),

  /**
   * Common
   * One of: oneprovider, onezone
   * @type {Ember.ComputedProperty<string>}
   */
  serviceType: reads('configurationProxy.serviceType'),

  /**
   * Common
   * @type {Ember.ComputedProperty<string>}
   */
  zoneDomain: reads('configurationProxy.zoneDomain'),

  /**
   * Onezone
   * @type {Ember.ComputedProperty<string>}
   */
  zoneName: reads('configurationProxy.zoneName'),

  /**
   * Oneprovider
   * @type {Ember.ComputedProperty<string>}
   */
  providerId: reads('configurationProxy.providerId'),

  /**
   * Oneprovider
   * @type {Ember.ComputedProperty<boolean>}
   */
  isRegistered: reads('configurationProxy.isRegistered'),

  init() {
    this._super(...arguments);

    // Load configuration on first use
    this.getConfigurationProxy();
  },

  /**
   * Fetches configuration
   * @returns {Promise<Object>}
   */
  fetchConfiguration() {
    return this.get('onepanelServer').fetchConfiguration();
  },
});
