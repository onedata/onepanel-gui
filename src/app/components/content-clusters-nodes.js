/**
 * Shows deployment table - used as a view for nodes aspect of cluster resource
 *
 * @author Jakub Liput
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/i18n';
import { promise } from 'ember-awesome-macros';
import clusterIpsConfigurator from 'onepanel-gui/mixins/components/cluster-ips-configurator';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import _ from 'lodash';

export default Component.extend(I18n, clusterIpsConfigurator, {
  onepanelServer: service(),
  deploymentManager: service(),
  providerManager: service(),
  globalNotify: service(),
  guiUtils: service(),

  i18nPrefix: 'components.contentClustersNodes',

  clusterHostsInfoProxy: promise.object(computed(function clusterHostsInfoProxy() {
    return this.get('deploymentManager').getClusterHostsInfo();
  })),

  /**
   * Hostname of primary cluster manager
   * @type {string}
   */
  primaryClusterManager: null,

  /**
   * If true, table of IPs is in edition mode
   * @type {boolean}
   */
  ipsEdit: false,

  _ipsFormData: undefined,

  _origIpsFormData: undefined,

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  onepanelServiceType: reads('guiUtils.serviceType'),

  /**
   * @override
   * @type {PromiseObject<ProviderDetails>}
   */
  providerDetailsProxy: computed(function providerDetailsProxy() {
    if (this.get('onepanelServiceType') === 'oneprovider') {
      return this.get('providerManager').getProviderDetailsProxy();
    }
  }),

  init() {
    this._super(...arguments);

    this.get('clusterHostsInfoProxy')
      .then(({ mainManagerHostname }) => {
        this.set('primaryClusterManager', mainManagerHostname);
      });
  },

  /**
   * @override
   */
  _startSetup() {
    return this._super(...arguments).then(() => {
      safeExec(this, 'set', 'ipsEdit', false);
    });
  },

  actions: {
    enableIpsEdit() {
      this.setProperties({
        ipsEdit: true,
        _origIpsFormData: _.cloneDeep(this.get('_ipsFormData')),
      });
    },

    cancelIpsEdit() {
      this.setProperties({
        ipsEdit: false,
        _ipsFormData: this.get('_origIpsFormData'),
        _origIpsFormData: undefined,
      });
    },
  },
});
