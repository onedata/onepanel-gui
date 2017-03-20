import Ember from 'ember';

const {
  computed: {
    alias,
  },
} = Ember;

export default Ember.ObjectProxy.extend({
  content: alias('clusterInfo'),

  /**
   * To inject.
   * @type {ClusterInfo}
   */
  clusterInfo: null,

  initStep: 0,
});
