/**
 * Provides data for routes and components assoctiated with clusters tab
 *
 * @module services/cluster-manager
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import ClusterInfo from 'onepanel-gui/models/cluster-info';
import ClusterDetails from 'onepanel-gui/models/cluster-details';

const {
  Service,
  inject: {
    service
  },
  RSVP: { Promise },
  A,
  computed: { readOnly },
  ObjectProxy,
  PromiseProxyMixin,
  String: { camelize }
} = Ember;

const ObjectPromiseProxy = ObjectProxy.extend(PromiseProxyMixin);

const THIS_CLUSTER_ID = 'the-cluster';

export default Service.extend({
  onepanelServer: service(),
  onepanelServiceType: readOnly('onepanelServer.serviceType'),

  /**
   * Stores the fetched cluster
   * @type {ClusterDetails}
   */
  clusterCache: null,

  /**
   * Promise proxy resolves with array of promise proxies for ClusterDetails
   * @returns {ObjectPromiseProxy}
   */
  getClusters() {
    let promise = new Promise((resolve) => {
      resolve(A([this.getClusterDetails()]));
    });
    return ObjectPromiseProxy.create({ promise });
  },

  // TODO: in future this should be able to get details of any cluster 
  // in system 
  /**
   * @returns {ObjectPromiseProxy}
   */
  getClusterDetails( /*clusterId*/ ) {
    let promise = new Promise((resolve) => {
      let clusterCache = this.get('clusterCache');
      if (clusterCache) {
        resolve(clusterCache);
      } else {
        let gettingInitStep = this._getThisClusterInitStep();

        gettingInitStep.then(step => {
          let thisCluster = ClusterInfo.create({
            id: THIS_CLUSTER_ID,
          });

          let clusterDetails = ClusterDetails.create({
            onepanelServiceType: this.get('onepanelServiceType'),
            clusterInfo: thisCluster,
            initStep: step,
          });

          this.set('clusterCache', clusterDetails);

          resolve(clusterDetails);
        });
      }
    });
    return ObjectPromiseProxy.create({ promise });
  },

  /**
   * @returns {Promise}
   */
  _checkIsConfigurationDone(onepanelServer) {
    let onepanelServiceType = this.get('onepanelServiceType');
    return new Promise((resolve, reject) => {
      let gettingConfiguration = onepanelServer.request(
        'one' + onepanelServiceType,
        camelize(`get-${onepanelServiceType}-configuration`)
      );

      // TODO do something with fetched configuration

      gettingConfiguration.then(({ data }) => resolve(!!data));

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

  // TODO allow only in provider mode  
  /**
   * @param {OnepanelServer} onepanelServer
   * @returns {Promise}
   */
  _checkIsProviderRegistered(onepanelServer) {
    return new Promise((resolve, reject) => {
      let gettingProvider = onepanelServer.request('oneprovider',
        'getProvider');

      gettingProvider.then(({ data: providerDetails }) => {
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

  // TODO allow only in provider mode  
  /**
   * @param {OnepanelServer} onepanelServer
   * @returns {Promise}
   */
  _checkIsAnyStorage(onepanelServer) {
    return new Promise((resolve, reject) => {
      let gettingStorages = onepanelServer.request('oneprovider', 'getStorages');

      gettingStorages.then(({ data: { ids } }) => {
        resolve(ids != null && ids.length > 0);
      });
      gettingStorages.catch(reject);
    });
  },

  /**
   * The promise resolves with number of initial cluster deployment step, that
   * should be opened for this cluster.
   *
   * The returned promise resolves with one of Number indicating wchich step had been done:
   * - 0: no installation done, initial
   * state, show "you have no cluster yet..."
   * - 1: installation done, but not registered - show registration step
   * - 2: installation and registration done, but no storage added yet - show add storage step
   * - 3: all done, should not show steps
   * @returns {Promise}
   */
  _getThisClusterInitStep() {
    let {
      onepanelServer,
      onepanelServiceType,
    } = this.getProperties('onepanelServer', 'onepanelServiceType');

    return new Promise((resolve, reject) => {
      let checkConfig = this._checkIsConfigurationDone(onepanelServer);

      checkConfig.then(isConfigurationDone => {
        if (isConfigurationDone) {
          // TODO VFS-3119
          if (onepanelServiceType === 'zone') {
            resolve(1);
          } else {
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
          }
        } else {
          resolve(0);
        }
      });
      checkConfig.catch(reject);
    });
  },

  /**
   * @return {Promise} resolves with Array.{ hostname: string }
   */
  getHosts(discovered = false) {
    return new Promise((resolve, reject) => {
      let gettingHostNames = this.getHostNames(discovered);

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

  getHostNames(discovered = false) {
    let onepanelServer = this.get('onepanelServer');
    return new Promise((resolve, reject) => {
      let gettingClusterHosts = onepanelServer.request(
        'onepanel',
        'getClusterHosts', { discovered }
      );
      gettingClusterHosts.then(resolve, reject);
    });
  }
});
