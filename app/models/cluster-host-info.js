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
