import Ember from 'ember';

const {
  Service,
  inject: {
    service
  },
  RSVP: {
    Promise
  },
  A,
  observer
} = Ember;

const ObjectPromiseProxy = Ember.ObjectProxy.extend(Ember.PromiseProxyMixin);

export default Service.extend({
  onepanelServer: service(),

  /**
   * TODO
   * This is something like a store
   * @return {Ember.A<Cluster>}
   */
  clusters: A(),
  
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
      
      gettingHostNames.then(({ data: hostnames }) => {
        // TODO more info
        resolve(hostnames.map(hostname => ({
          hostname
        })));
      });
      
      gettingHostNames.catch(error => {
        console.error('service:cluster-manager: Getting hostnames failed');
        reject(error);
      });
    });
  },
  
  getHostNames() {
    // TODO cannot get onepanelApi if not authorized -
    // so make get onepaneApi as a promise or block whole session...
    // FIXME TODO an ugly hack to delay use of onepanelApi
    let onepanelServer = this.get('onepanelServer');
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let gettingClusterHosts = onepanelServer.request('onepanel', 'getClusterHosts', {
          discovered: true
        });
        gettingClusterHosts.then(resolve, reject);
      }, 1000);      
    });    
  }
});
