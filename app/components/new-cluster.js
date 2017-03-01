import Ember from 'ember';

export default Ember.Component.extend({
  // TODO: i18n
  steps: [{
    id: 0,
    title: 'cluster installation'
  }, {
    id: 1,
    title: 'zone registration'
  }, {
    id: 2,
    title: 'storage configuration'
  }, {
    id: 3,
    title: 'summary'
  }],
  
  actions: {
    clusterCreated(cluster) {
      // FIXME cluster.get('id')
      this.set('clusterId', cluster.id);
    }
  }
});
