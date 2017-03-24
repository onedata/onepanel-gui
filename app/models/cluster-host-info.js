/**
 * A model of host that can be used for deployment of cluster
 *
 * Contains roles that the host will provide in cluster.
 *
 * @module models/cluster-host-info
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

const {
  computed
} = Ember;

/**
 * @typedef {EmberObject} ClusterHostInfo
 * @property {computed.string} hostname
 * @property {computed.boolean} database true if host will run database
 * @property {computed.boolean} clusterWorker true if host will run cluster worker
 * @property {computed.boolean} clusterManager true if host will run cluster manager
 */
export default Ember.Object.extend({
  hostname: null,

  // roles
  database: false,
  clusterWorker: false,
  clusterManager: false,

  isUsed: computed('database', 'clusterWorker', 'clusterManager', function () {
    let {
      database,
      clusterWorker,
      clusterManager,
    } = this.getProperties('database', 'clusterWorker', 'clusterManager');
    return database || clusterWorker || clusterManager;
  })
});
