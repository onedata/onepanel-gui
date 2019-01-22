/**
 * Shows deployment table - used as a view for nodes aspect of cluster resource
 *
 * @module components/content-cluster-nodes
 * @author Jakub Liput
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

import { inject as service } from '@ember/service';
import { Promise } from 'rsvp';
import { computed } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';

import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import clusterIpsConfigurator from 'onepanel-gui/mixins/components/cluster-ips-configurator';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import _ from 'lodash';

export default Component.extend(I18n, clusterIpsConfigurator, {
  onepanelServer: service(),
  configurationManager: service(),
  providerManager: service(),
  globalNotify: service(),
  guiUtils: service(),

  i18nPrefix: 'components.contentClustersNodes',

  /**
   * @override
   * @type {PromiseObject<ProviderDetails>}
   */
  providerDetailsProxy: computed(function getProviderDetailsProxy() {
    if (this.get('guiUtils.serviceType') === 'oneprovider') {
      return this.get('providerManager').getProviderDetails();
    }
  }),

  /**
   * Resolves with EmberArray of ClusterHostInfo.
   * @type {PromiseObject.Array.ClusterHostInfo} hostsProxy
   */
  hostsProxy: null,

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

  init() {
    this._super(...arguments);
    let resolveClusterHosts, rejectClusterHosts;

    let clusterHostsPromise = new Promise((resolve, reject) => {
      resolveClusterHosts = resolve;
      rejectClusterHosts = reject;
    });

    let gettingHostsInfo = this.get('configurationManager').getClusterHostsInfo();

    gettingHostsInfo.then(({ mainManagerHostname, clusterHostsInfo }) => {
      resolveClusterHosts(clusterHostsInfo);
      this.set('primaryClusterManager', mainManagerHostname);
    });

    gettingHostsInfo.catch(error => {
      rejectClusterHosts(error);
    });

    this.set(
      'hostsProxy',
      PromiseObject.create({
        promise: clusterHostsPromise,
      })
    );
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
