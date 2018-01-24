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

import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';

export default Component.extend({
  onepanelServer: service(),
  clusterManager: service(),
  globalNotify: service(),

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
  },
});
