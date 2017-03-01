import Ember from 'ember';

const {
  assert,
  inject: {
    service
  }
} = Ember;

export default Ember.Component.extend({
  clusterManager: service('clusterManager'),
  
  primaryHost: null,
  
  hosts: [
    {
      hostname: 'node1'
    },
    {
      hostname: 'node2'
    }
  ],
  
  actions: {
    checkboxChanged(checked, event) {
      let hosts = this.get('hosts');
      let checkbox = event.currentTarget;
      let hostname = checkbox.getAttribute('data-hostname');
      let option = checkbox.getAttribute('data-option');
      let host = hosts.find(h => h.hostname === hostname);
      assert(
        host,
        'host for which option was changed, must be present in collection'
      );
      host[option] = checked;
      
      // TODO debug
      console.debug(JSON.stringify(hosts));
    },
    
    primaryHostChanged(hostname) {
      this.set('primaryHost', hostname);
    },
    
    deploy() {
      // TODO use API
      // TODO block if not valid
      
      // TODO get name for cluster from user
      let id = 'x';
      
      
      let creatingCluster = this.get('clusterManager').createCluster({
        id,
        label: 'New cluster'
      });
      
      // TODO handle reject
      
      creatingCluster.then(cluster => {
        this.sendAction('clusterCreated', cluster);
        this.sendAction('nextStep');
      });
    }
  }
});
