import Component from '@ember/component';
import { invokeAction } from 'ember-invoke-action';
import { inject as service } from '@ember/service';

export default Component.extend({
  clusterManager: service(),

  /**
   * @virtual
   * @type {string}
   */
  clusterId: null,

  init() {
    this._super(...arguments);

    const {
      clusterId,
      clusterManager,
    } = this.getProperties('clusterId', 'clusterManager');

    // reload cluster details
    clusterManager.getClusterDetails(clusterId, true, true);
  },

  actions: {
    manageNewCluster() {
      return invokeAction(this, 'finish');
    },
  },
});
