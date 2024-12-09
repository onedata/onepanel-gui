/**
 * A model of host that can be used for deployment of cluster
 *
 * Contains roles that the host will provide in cluster.
 *
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { computed } from '@ember/object';

/**
 * @typedef {EmberObject} ClusterHostInfo
 * @property {computed.string} hostname
 * @property {computed.boolean} database true if host will run database
 * @property {computed.boolean} clusterWorker true if host will run cluster worker
 * @property {computed.boolean} clusterManager true if host will run cluster manager
 * @property {computed.boolean} oneS3 true if host will run oneS3
 */
export default EmberObject.extend({
  hostname: null,

  // roles
  database: false,
  clusterWorker: false,
  clusterManager: false,
  oneS3: false,

  isUsed: computed(
    'database',
    'clusterWorker',
    'clusterManager',
    'oneS3',
    function isUsed() {
      return this.database || this.clusterWorker || this.clusterManager || this.oneS3;
    }
  ),
});
