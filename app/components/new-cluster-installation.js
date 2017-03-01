import Ember from 'ember';

const {
  assert,
  inject: {
    service
  }
} = Ember;

let ObjectPromiseProxy = Ember.ObjectProxy.extend(Ember.PromiseProxyMixin);

export default Ember.Component.extend({
  clusterManager: service('clusterManager'),
  
  primaryHost: null,
  
  /**
   * @type {ObjectPromiseProxy<Ember.A<HostInfo>>}
   */
  hosts: null,
  
  init() {
    this._super(...arguments);
    this.set(
      'hosts',
      ObjectPromiseProxy.create({
        promise: this.get('clusterManager').getHosts()
      })
    );
  },
    
  actions: {
    checkboxChanged(checked, event) {
      let hosts = this.get('hosts.content');
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
