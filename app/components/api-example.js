import Ember from 'ember';

const {
  inject: {
    service
  },
  observer,
  computed: {
    alias
  },
  assert
} = Ember;

export default Ember.Component.extend({
  onepanelServer: service(),

  username: null,
  password: null,

  isAuthenticated: alias('onepanelServer.isInitialized'),
  isLoading: alias('onepanelServer.isLoading'),
  
  init() {
    this._super(...arguments);
    this.watchAuthentication();
  },
  
  watchAuthentication: observer('isAuthenticated', function() {
    if (this.get('isAuthenticated')) {
      this.getClusterHosts();
    }
  }),

  getClusterHosts() {
    let onepanelApi = this.get('onepanelServer.onepanelApi');
    assert('onepanel api object should not be null', onepanelApi);
    let gettingClusterHosts = onepanelApi.getClusterHosts({
      discovered: true
    });
    gettingClusterHosts.then(data => {
      console.log('received cluster hosts: ' + JSON.stringify(data));
      this.set('clusterHosts', data);
    });
    gettingClusterHosts.catch(error => {
      console.error('error on receiving cluster hosts: ' + JSON.stringify(error));
    });
  },
});
