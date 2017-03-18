import Ember from 'ember';
import Cluster from 'onepanel-web-frontend/utils/cluster';
import Onepanel from 'npm:onepanel';

const {
  Service,
  inject: {
    service
  },
  RSVP,
  RSVP: {
    Promise
  },
  A,
  computed,
} = Ember;

const {
  ProviderConfiguration
} = Onepanel;

const ObjectPromiseProxy = Ember.ObjectProxy.extend(Ember.PromiseProxyMixin);

export default Service.extend({
  onepanelServer: service(),

  // TODO: use clustersProxy  
  clusters: A(),

  /**
   * TODO when creating "the only cluster" get info about deployment state
   * This is something like a store
   * @return {Ember.A<Cluster>}
   */
  clustersProxy: computed(function () {
    return ObjectPromiseProxy.create({
      promise: this.getClusters()
    });
  }),

  getClusters() {
    return new Promise((resolve, reject) => {
      let gettingInitStep = this._getThisClusterInitStep();

      gettingInitStep.then(step => {
        let thisCluster = Cluster.create({
          name: 'The Cluster',
          initStep: step
        });
        resolve(A([thisCluster]));
      });

      gettingInitStep.catch(reject);
    });
  },

  /**
   * @returns {Promise}
   */
  _checkIsConfigurationDone(onepanelServer) {
    return new Promise((resolve, reject) => {
      let gettingConfiguration = onepanelServer.request(
        'oneprovider', 'getProviderConfiguration');

      // TODO do something with fetched configuration

      gettingConfiguration.then(() => resolve(true));

      gettingConfiguration.catch(error => {
        let statusCode = error.response.statusCode;
        if (statusCode === 404) {
          // no configuration found - user didn't started the deployment
          resolve(false);
        } else {
          reject(error);
        }
      });
    });
  },

  _checkIsProviderRegistered(onepanelServer) {
    return new Promise((resolve, reject) => {
      let gettingProvider = onepanelServer.request('oneprovider',
        'getProvider');

      gettingProvider.then(providerDetails => {
        // if details found, then the provider was registered
        resolve(!!providerDetails);
      });
      gettingProvider.catch(error => {
        let statusCode = error.response.statusCode;
        if (statusCode === 404) {
          // not registered yet, maybe not deployed yet
          resolve(false);
        } else {
          reject(error);
        }
      });
    });
  },

  _checkIsAnyStorage(onepanelServer) {
    return new Promise((resolve, reject) => {
      let gettingStorages = onepanelServer.request('oneprovider',
        'getStorages');
      gettingStorages.then(() => resolve(true));
      gettingStorages.catch(reject);
    });
  },

  /**
   * The promise resolves with number of initial cluster deployment step, that
   * should be opened for this cluster.
   * @returns {Promise}
   */
  _getThisClusterInitStep() {
    let onepanelServer = this.get('onepanelServer');
    return new Promise((resolve, reject) => {

      let checkConfig = this._checkIsConfigurationDone(onepanelServer);

      checkConfig.then(isConfigurationDone => {
        if (isConfigurationDone) {
          let checkRegister = this._checkIsProviderRegistered(onepanelServer);
          checkRegister.then(isProviderRegistered => {
            if (isProviderRegistered) {
              let checkStorage = this._checkIsAnyStorage(onepanelServer);
              checkStorage.then(isAnyStorage => {
                if (isAnyStorage) {
                  resolve(3);
                } else {
                  resolve(2);
                }
              });
              checkStorage.catch(reject);
            } else {
              resolve(1);
            }
          });
          checkRegister.catch(reject);
        } else {
          resolve(0);
        }
      });
      checkConfig.catch(reject);
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
        console.error(
          'service:cluster-manager: Getting hostnames failed'
        );
        reject(error);
      });
    });
  },

  getHostNames() {
    let onepanelServer = this.get('onepanelServer');
    return new Promise((resolve, reject) => {
      let gettingClusterHosts = onepanelServer.request(
        'onepanel',
        'getClusterHosts', {
          discovered: true
        });
      gettingClusterHosts.then(resolve, reject);
    });
  }
});
