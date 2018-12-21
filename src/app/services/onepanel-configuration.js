/**
 * Provides information available at /configuration endpoint.
 *
 * @module services/onepanel-configuration
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

// FIXME this service should provide clusterId and onezoneDomain. It depends on
// future backend.

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
   * @type {Ember.ComputedProperty<string>}
   */
  version: reads('configurationProxy.version'),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  build: reads('configurationProxy.build'),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  deployed: reads('configurationProxy.deployed'),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  onezoneDomain: reads('configurationProxy.onezoneDomain'),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  clusterId: reads('configurationProxy.clusterId'),

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
