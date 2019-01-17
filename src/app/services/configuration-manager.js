// FIXME: outdated description
/**
 * Provides data for routes and components assoctiated with clusters tab
 *
 * @module services/configuration-manager
 * @author Jakub Liput
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';

import { Promise } from 'rsvp';
import { A } from '@ember/array';
import { get } from '@ember/object';
import { reads, alias } from '@ember/object/computed';
import ObjectProxy from '@ember/object/proxy';
import { camelize } from '@ember/string';
import ClusterInfo from 'onepanel-gui/models/cluster-info';
import ClusterDetails, { CLUSTER_INIT_STEPS as STEP } from 'onepanel-gui/models/cluster-details';
import ClusterHostInfo from 'onepanel-gui/models/cluster-host-info';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';

const _ROLE_COLLECTIONS = {
  databases: 'database',
  managers: 'clusterManager',
  workers: 'clusterWorker',
};

export default Service.extend({
  clusterModelManager: service(),
  onepanelServer: service(),
  onepanelServiceType: reads('onepanelServer.serviceType'),

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

  // FIXME: needs refactor - the-cluster should be named that way
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

  // FIXME: needs refactor - the-cluster should be named that way
  getDefaultRecord(reload = false) {
    return this.getInstallationDetails(reload);
  },

  // TODO: in future this should be able to get details of any cluster 
  // in system 
  /**
   * @param {boolean} [reload=false]
   * @returns {PromiseObject}
   */
  getInstallationDetails(reload = false) {
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

          let gettingConfiguration = this.getConfiguration();

          return new Promise(resolveConfiguration => {
            gettingConfiguration.then(({ data: configuration }) => {
              resolveConfiguration(configuration);
            });

            gettingConfiguration.catch(() => {
              resolveConfiguration(null);
            });
          });

        }).then(configuration => {

          return this.get('clusterModelManager').getRawCurrentClusterProxy()
            .then(
              currentCluster => {
                const currentClusterId = (
                  currentCluster && get(currentCluster, 'id') || 'new'
                );
                const name = (configuration || null) &&
                  configuration[onepanelServiceType].name;
                const thisCluster = ClusterInfo.create({
                  id: currentClusterId,
                }, configuration);

                const clusterDetails = ClusterDetails.create({
                  name,
                  onepanelServiceType: onepanelServiceType,
                  clusterInfo: thisCluster,
                  initStep: clusterStep,
                });

                this.set('_defaultCache', clusterDetails);
                resolve(defaultCache);
              });
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
      let gettingConfiguration = this.getConfiguration(true);
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
  getConfiguration(validateData) {
    let {
      onepanelServer,
      onepanelServiceType,
    } = this.getProperties('onepanelServer', 'onepanelServiceType');
    let requestFun =
      (validateData ? onepanelServer.requestValidData : onepanelServer.request)
      .bind(onepanelServer);
    return requestFun(
      onepanelServiceType,
      camelize(`get-${onepanelServiceType.substring(3)}-configuration`)
    );
  },

  getClusterIps() {
    const {
      onepanelServer,
      onepanelServiceType,
    } = this.getProperties('onepanelServer', 'onepanelServiceType');
    return onepanelServer.request(
        onepanelServiceType,
        camelize(`get-${onepanelServiceType.substring(3)}-cluster-ips`)
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
        onepanelServiceType,
        camelize(`modify-${onepanelServiceType.substring(3)}-cluster-ips`), {
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
      let gettingConfiguration = this.getConfiguration();
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

  _checkIsDnsCheckAcknowledged() {
    const onepanelServer = this.get('onepanelServer');

    return onepanelServer.request('onepanel', 'getDnsCheckConfiguration')
      .then(({ data }) => data.dnsCheckAcknowledged);
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
          if (onepanelServiceType === 'onezone') {
            const checkIps = this._checkIsIpsConfigured();
            checkIps.then(isIpsConfigured => {
              if (isIpsConfigured) {
                const checkDnsCheck = this._checkIsDnsCheckAcknowledged();
                checkDnsCheck.then(dnsCheckAck => {
                  if (dnsCheckAck) {
                    resolve(STEP.ZONE_DONE);
                  } else {
                    resolve(STEP.ZONE_DNS);
                  }
                });
                checkDnsCheck.catch(reject);
              } else {
                resolve(STEP.ZONE_IPS);
              }
            });
            checkIps.catch(reject);
          } else {
            const checkRegister = this._checkIsProviderRegistered(
              onepanelServer
            );
            checkRegister.then(({
              isRegistered: isProviderRegistered,
            }) => {
              if (isProviderRegistered) {
                const checkIps = this._checkIsIpsConfigured();
                checkIps.then(isIpsConfigured => {
                  if (isIpsConfigured) {
                    const checkStorage = this._checkIsAnyStorage(
                      onepanelServer
                    );
                    const checkDnsCheck = this._checkIsDnsCheckAcknowledged();
                    checkDnsCheck.then(dnsCheckAck => {
                      if (dnsCheckAck) {
                        checkStorage.then(isAnyStorage => {
                          if (isAnyStorage) {
                            resolve(STEP.PROVIDER_DONE);
                          } else {
                            resolve(STEP.PROVIDER_STORAGE_ADD);
                          }
                        });
                        checkStorage.catch(reject);
                      } else {
                        resolve(STEP.PROVIDER_DNS);
                      }
                    });
                    checkDnsCheck.catch(reject);
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
   * @param {string} type
   * @return {Promise} resolves with Array.{ hostname: string }
   */
  getHosts(type = 'known') {
    return new Promise((resolve, reject) => {
      let gettingHostNames = this.getHostNames(type);

      gettingHostNames.then(({ data: hostnames }) => {
        // TODO more info
        resolve(hostnames.map(hostname => ({
          hostname,
        })));
      });

      gettingHostNames.catch(error => {
        console.error(
          'service:configuration-manager: Getting hostnames failed'
        );
        reject(error);
      });
    });
  },

  /**
   * @param {string} type one of: known, cluster
   * @returns {Promise}
   */
  getHostNames() {
    let onepanelServer = this.get('onepanelServer');
    return onepanelServer.requestValidData(
      'onepanel',
      'getClusterHosts',
    );
  },

  /**
   * @param {string} address hostname or IP address
   * @returns {Promise<Onepanel.KnownHost>}
   */
  addKnownHost(address) {
    return this.get('onepanelServer').request(
      'onepanel',
      'addClusterHost', { address }
    ).then(({ data }) => data);
  },
});
