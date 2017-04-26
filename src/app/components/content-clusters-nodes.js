/**
 * Shows deployment table - used as a view for nodes aspect of cluster resource
 *
 * @module components/content-cluster-nodes
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

const {
  Component,
  inject: { service },
  ObjectProxy,
  PromiseProxyMixin,
  RSVP: { Promise },
} = Ember;

const ObjectPromiseProxy = ObjectProxy.extend(PromiseProxyMixin);

export default Component.extend({
  onepanelServer: service(),
  clusterManager: service(),
  globalNotify: service(),

  /**
   * Resolves with EmberArray of ClusterHostInfo.
   * @type {ObjectPromiseProxy.Array.ClusterHostInfo} hostsProxy
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
      ObjectPromiseProxy.create({
        promise: clusterHostsPromise
      })
    );
  },
});
