import Ember from 'ember';

const {
  Service,
  inject: {
    service
  },
  RSVP: {
    Promise
  },
  A
} = Ember;

export default Service.extend({
  onepanelServer: service(),

  /**
   * TODO
   * This is something like a store
   * @return {Ember.A<Cluster>}
   */
  clusters: A([]),
  
  /**
   * @typedef {Cluster}
   * @param {string} name
   */
  
  /**
   * @param {Cluster} cluster 
   */
  createCluster(cluster) {
    return new Promise((resolve) => {
      this.get('clusters').pushObject(cluster);
      resolve(cluster);
    });
  },
  
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
