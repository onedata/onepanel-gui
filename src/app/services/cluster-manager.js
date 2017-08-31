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
import ClusterHostInfo from 'onepanel-gui/models/cluster-host-info';

const {
  Service,
  inject: {
    service,
  },
  RSVP: { Promise },
  A,
  computed: { alias, readOnly },
  ObjectProxy,
  String: { camelize },
} = Ember;

import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';

const THIS_CLUSTER_ID = 'the-cluster';

const _ROLE_COLLECTIONS = {
  databases: 'database',
  managers: 'clusterManager',
  workers: 'clusterWorker',
};

export default Service.extend({
  onepanelServer: service(),
  onepanelServiceType: readOnly('onepanelServer.serviceType'),

  /**
   * Contains latest fetched ClusterDetails
   * @type {ObjectProxy.ClusterDetails}
   */
  defaultCache: ObjectProxy.create({ content: null }),

  /**
   * Last feched ClusterDetails
   * @type {ClusterDetails}
   */
  _defaultCache: alias('defaultCache.content'),

  /**
   * Promise proxy resolves with array of promise proxies for ClusterDetails
   * @returns {PromiseObject}
   */
  getClusters() {
    let promise = new Promise((resolve) => {
      resolve(A([this.getDefaultRecord()]));
    });
    return PromiseObject.create({ promise });
  },

  getDefaultRecord(reload = false) {
    return this.getClusterDetails(undefined, reload);
  },

  // TODO: in future this should be able to get details of any cluster 
  // in system 
  /**
   * @returns {PromiseObject}
   */
  getClusterDetails(clusterId, reload = false) {
    let {
      onepanelServiceType,
      defaultCache,
      _defaultCache,
    } = this.getProperties(
      'onepanelServiceType',
      'defaultCache',
      '_defaultCache'
    );

    let promise = new Promise((resolve, reject) => {
      if (_defaultCache && !reload) {
        resolve(defaultCache);
      } else {
        let clusterStep;

        let gettingStep = this._getThisClusterInitStep();

        gettingStep.then(step => {
          clusterStep = step;

          let gettingConfiguration = this._getConfiguration();

          return new Promise(resolveName => {
            gettingConfiguration.then(({ data: configuration }) => {
              let name = configuration['one' + onepanelServiceType].name;
              resolveName(name);
            });

            gettingConfiguration.catch(() => {
              resolveName(null);
            });
          });

        }).then((name) => {
          let thisCluster = ClusterInfo.create({
            id: THIS_CLUSTER_ID,
          });

          let clusterDetails = ClusterDetails.create({
            name,
            onepanelServiceType: onepanelServiceType,
            clusterInfo: thisCluster,
            initStep: clusterStep,
          });

          this.set('_defaultCache', clusterDetails);
          resolve(defaultCache);
        }).catch(reject);

        gettingStep.catch(reject);
      }
    });
    return PromiseObject.create({ promise });
  },

  /**
   * Fetch info about deployed cluster and create ClusterHostInfo objects
   * @returns {Promise} resolves with
   *  { mainManagerHostname: string, clusterHostsInfo: Array.ClusterHostInfo }
   */
  getClusterHostsInfo() {
    return new Promise((resolve, reject) => {
      let gettingConfiguration = this._getConfiguration(true);
      gettingConfiguration.then(({ data: { cluster } }) => {
        resolve(this._clusterConfigurationToHostsInfo(cluster));
      });
      gettingConfiguration.catch(reject);
    });
  },

  /**
   * Converts response data from API about clusters to array of ``ClusterHostInfo``
   * @param {object} cluster cluster attribute of GET configuration from API
   * @returns {object}
   *  { mainManagerHostname: string, clusterHostsInfo: Array.ClusterHostInfo }
   */
  _clusterConfigurationToHostsInfo(cluster) {
    let types = ['databases', 'managers', 'workers'];
    // maps: host -> ClusterHostInfo
    let clusterHostsInfo = {};
    types.forEach(type => {
      cluster[type].hosts.forEach(host => {
        if (clusterHostsInfo[host] == null) {
          clusterHostsInfo[host] = ClusterHostInfo.create({
            hostname: host,
          });
        }
        clusterHostsInfo[host].set(_ROLE_COLLECTIONS[type], true);
      });
    });

    // TODO use Array.prototype.values if available
    let clusterHostsInfoArray = [];
    for (let host in clusterHostsInfo) {
      clusterHostsInfoArray.push(clusterHostsInfo[host]);
    }

    return {
      mainManagerHostname: cluster.managers.mainHost,
      clusterHostsInfo: clusterHostsInfoArray,
    };

  },

  /**
   * Get a cluster configuration for current service type
   * @param {boolean} [validateData] if true, make validation of cluster configuration
   * @returns {Promise} result of GET configuration request
   */
  _getConfiguration(validateData) {
    let {
      onepanelServer,
      onepanelServiceType,
    } = this.getProperties('onepanelServer', 'onepanelServiceType');
    let requestFun =
      (validateData ? onepanelServer.requestValidData : onepanelServer.request)
      .bind(onepanelServer);
    return requestFun(
      'one' + onepanelServiceType,
      camelize(`get-${onepanelServiceType}-configuration`)
    );
  },

  /**
   * @returns {Promise}
   */
  _checkIsConfigurationDone() {
    return new Promise((resolve, reject) => {
      let gettingConfiguration = this._getConfiguration();
      gettingConfiguration.then(({ data }) => resolve(!!data));

      gettingConfiguration.catch(error => {
        if (error == null || error.response == null) {
          reject(error);
        } else {
          let statusCode = error.response.statusCode;
          if (statusCode === 404) {
            // no configuration found - user didn't started the deployment
            resolve(false);
          } else {
            reject(error);
          }
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
        if (error == null || error.response == null) {
          reject(error);
        } else {
          let statusCode = error.response.statusCode;
          if (statusCode === 404) {
            // not registered yet, maybe not deployed yet
            resolve(false);
          } else {
            reject(error);
          }
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
          hostname,
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
      let gettingClusterHosts = onepanelServer.requestValidData(
        'onepanel',
        'getClusterHosts', { discovered }
      );
      gettingClusterHosts.then(resolve, reject);
    });
  },
});
