import Ember from 'ember';

const {
  assert
} = Ember;

export default Ember.Component.extend({
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
      this.sendAction('nextStep');
    }
  }
});
