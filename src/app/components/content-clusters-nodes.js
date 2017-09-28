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
  RSVP: { Promise },
} = Ember;

import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';

export default Component.extend({
  onepanelServer: service(),
  clusterManager: service(),
  globalNotify: service(),

  data: [{
      startedAt: new Date(),
      stoppedAt: new Date(),
      releasedSize: 10485760,
      plannedReleasedSize: 20485760,
      filesNumber: 24,
      status: 'success',
    }, {
      startedAt: new Date(),
      stoppedAt: new Date(),
      releasedSize: 80485760,
      plannedReleasedSize: 20485760,
      filesNumber: 18,
      status: 'failure',
    },
  ],

  bardata: Ember.Object.create({
    spaceSize: 10485760,
    // usedSpace: 1048576,
    usedSpace: 7340032,
    // usedSpace: 9937184,
    cleanThreshold: 8388608,
    cleanTarget: 6291456,
    isCleaning: true,
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
  actions: {
    sliderChange({ cleanTarget, cleanThreshold }) {
      this.get('bardata').setProperties({
        cleanTarget,
        cleanThreshold,
      });
      return new Ember.RSVP.Promise((resolve) => setTimeout(resolve, 500));
    },
  },
});
