/**
 * Provides data for routes and components assoctiated with clusters tab
 *
 * @module services/cluster-manager
 * @author Jakub Liput
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';

import { Promise } from 'rsvp';
import { A } from '@ember/array';
import { get } from '@ember/object';
import { readOnly, alias } from '@ember/object/computed';
import ObjectProxy from '@ember/object/proxy';
import { camelize } from '@ember/string';
import ClusterInfo from 'onepanel-gui/models/cluster-info';
import ClusterDetails, { CLUSTER_INIT_STEPS as STEP } from 'onepanel-gui/models/cluster-details';
import ClusterHostInfo from 'onepanel-gui/models/cluster-host-info';
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
   * @param {string} clusterId
   * @param {boolean} [reload=false]
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

  getClusterIps() {
    const {
      onepanelServer,
      onepanelServiceType,
    } = this.getProperties('onepanelServer', 'onepanelServiceType');
    return onepanelServer.request(
        'one' + onepanelServiceType,
        camelize(`get-${onepanelServiceType}-cluster-ips`)
      )
      .then(({ data }) => data);
  },

  /**
   * @param {Object} hostsData 
   * @return {Promise<Object>}
   */
  modifyClusterIps(hostsData) {
    const {
      onepanelServer,
      onepanelServiceType,
    } = this.getProperties('onepanelServer', 'onepanelServiceType');
    return onepanelServer.request(
        'one' + onepanelServiceType,
        camelize(`modify-${onepanelServiceType}-cluster-ips`), {
          hosts: hostsData,
        },
      )
      .then(({ data }) => data);
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
   * @returns {Promise} resolves with
   *  `{ isRegistered: boolean, [providerDetails]: <provider details object if avail.> }`
   */
  _checkIsProviderRegistered(onepanelServer) {
    return new Promise((resolve, reject) => {
      let gettingProvider = onepanelServer.request('oneprovider',
        'getProvider');

      gettingProvider.then(({ data: providerDetails }) => {
        // if details found, then the provider was registered
        resolve({ isRegistered: !!providerDetails, providerDetails: providerDetails });
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

  _checkIsIpsConfigured() {
    return this.getClusterIps()
      .then(({ isConfigured }) => isConfigured);
  },

  /**
   * The promise resolves with number of initial cluster deployment step, that
   * should be opened for this cluster.
   * See `model:cluster-details CLUSTER_INIT_STEPS` for code explaination.
   * @returns {Promise}
   */
  _getThisClusterInitStep() {
    let {
      onepanelServer,
      onepanelServiceType,
    } = this.getProperties('onepanelServer', 'onepanelServiceType');

    return new Promise((resolve, reject) => {
      const checkConfig = this._checkIsConfigurationDone(onepanelServer);

      checkConfig.then(isConfigurationDone => {
        if (isConfigurationDone) {
          // TODO VFS-3119
          if (onepanelServiceType === 'zone') {
            const checkIps = this._checkIsIpsConfigured();
            checkIps.then(isIpsConfigured => {
              resolve(isIpsConfigured ? STEP.ZONE_IPS + 1 : STEP.ZONE_IPS);
            });
            checkIps.catch(reject);
          } else {
            const checkRegister = this._checkIsProviderRegistered(
              onepanelServer
            );
            checkRegister.then(({
              isRegistered: isProviderRegistered,
              providerDetails,
            }) => {
              if (isProviderRegistered) {
                const checkIps = this._checkIsIpsConfigured();
                checkIps.then(isIpsConfigured => {
                  if (isIpsConfigured) {
                    if (
                      get(providerDetails, 'letsEncryptEnabled') !==
                      undefined
                    ) {
                      const checkStorage = this._checkIsAnyStorage(
                        onepanelServer
                      );
                      checkStorage.then(isAnyStorage => {
                        if (isAnyStorage) {
                          resolve(
                            STEP.PROVIDER_STORAGE_ADD + 1
                          );
                        } else {
                          resolve(STEP.PROVIDER_STORAGE_ADD);
                        }
                      });
                      checkStorage.catch(reject);
                    } else {
                      resolve(STEP.PROVIDER_CERT_GENERATE);
                    }
                  } else {
                    resolve(STEP.PROVIDER_IPS);
                  }
                });
                checkIps.catch(reject);
              } else {
                resolve(STEP.PROVIDER_REGISTER);
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
  getHosts() {
    return new Promise((resolve, reject) => {
      let gettingHostNames = this.getHostNames();

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

  getHostNames() {
    let onepanelServer = this.get('onepanelServer');
    return new Promise((resolve, reject) => {
      let gettingClusterHosts = onepanelServer.requestValidData(
        'onepanel',
        'getClusterHosts',
      );
      gettingClusterHosts.then(resolve, reject);
    });
  },
});
