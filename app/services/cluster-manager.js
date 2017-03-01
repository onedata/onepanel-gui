import Ember from 'ember';

const {
  Service,
  inject: {
    service
  },
  RSVP: {
    Promise
  }
} = Ember;

export default Service.extend({
  onepanelServer: service(),
  
  /**
   * @return {HostInfo}
   */
  getHosts() {
    return new Promise((resolve, reject) => {
      let gettingHostNames = this.getHostNames();
      
      gettingHostNames.then(hostnames => {
        // TODO more info
        hostnames.map(hostname => ({
          hostname
        }));
      });
      
      gettingHostNames.catch(error => {
        console.error('service:cluster-manager: Getting hostnames failed');
        reject(error);
      });
    });
  },
  
  getHostNames() {
    let onepanelApi = this.get('onepanelServer.onepanelApi');
    return onepanelApi.getClusterHosts({
      discovered: true
    });
  }
});
