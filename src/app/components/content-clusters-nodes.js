/**
 * Shows deployment table - used as a view for nodes aspect of cluster resource
 *
 * @module components/content-cluster-nodes
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

import { inject as service } from '@ember/service';
import { Promise } from 'rsvp';
import I18n from 'onedata-gui-common/mixins/components/i18n';

import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import clusterIpsConfigurator from 'onepanel-gui/mixins/components/cluster-ips-configurator';

export default Component.extend(I18n, clusterIpsConfigurator, {
  onepanelServer: service(),
  clusterManager: service(),
  globalNotify: service(),

  i18nPrefix: 'components.contentClustersNodes',

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

  _ipsFormData: undefined,

  init() {
    this._super(...arguments);
    let resolveClusterHosts, rejectClusterHosts;

    let clusterHostsPromise = new Promise((resolve, reject) => {
      resolveClusterHosts = resolve;
      rejectClusterHosts = reject;
    });

    let gettingHostsInfo = this.get('clusterManager').getClusterHostsInfo();

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

    this.set(
      'hostIpsProxy',
      PromiseObject.create({
        promise: this.get('clusterManager').getClusterIps()
          .then(({ hosts }) => {
            for (const hostname in hosts) {
              if (hosts[hostname] === '127.0.0.1') {
                hosts[hostname] = '';
              }
            }
            this.set('_ipsFormData', hosts);
            return hosts;
          }),
      }),
    );
  },
});
