/**
 * Provides data for routes and components assoctiated with deployment of cluster
 *
 * @module services/deployment-manager
 * @author Jakub Liput
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';

import { Promise } from 'rsvp';
import { get } from '@ember/object';
import { reads, alias } from '@ember/object/computed';
import ObjectProxy from '@ember/object/proxy';
import { camelize } from '@ember/string';
import ClusterInfo from 'onepanel-gui/models/cluster-info';
import InstallationDetails, { CLUSTER_INIT_STEPS as STEP } from 'onepanel-gui/models/installation-details';
import ClusterHostInfo from 'onepanel-gui/models/cluster-host-info';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import shortServiceType from 'onepanel-gui/utils/short-service-type';

const _ROLE_COLLECTIONS = {
  databases: 'database',
  managers: 'clusterManager',
  workers: 'clusterWorker',
};

export default Service.extend(createDataProxyMixin('installationDetails'), {
  clusterModelManager: service(),
  onepanelServer: service(),
  guiUtils: service(),

  onepanelServiceType: reads('guiUtils.serviceType'),

  /**
   * Contains latest fetched ClusterDetails
   * @type {ObjectProxy.ClusterDetails}
   */
  defaultCache: ObjectProxy.create({ content: null }),

  /**
   * Last feched ClusterDetails
   * @type {InstallationDetails}
   */
  _defaultCache: alias('defaultCache.content'),

  /**
   * @override
   */
  fetchInstallationDetails() {
    const onepanelServiceType = this.get('onepanelServiceType');

    let clusterStep;

    return this._getThisClusterInitStep()
      .then(step => {
        clusterStep = step;

        return this.getConfiguration()
          .then(({ data: configuration }) => {
            return configuration;
          })
          .catch(() => {
            return null;
          });
      })
      .then(configuration => {
        return this.get('clusterModelManager').getRawCurrentClusterProxy()
          .then(currentCluster => {
            const currentClusterId = (
              currentCluster && get(currentCluster, 'id') || 'new'
            );
            const name = (configuration || null) &&
              configuration[onepanelServiceType].name;
            const thisCluster = ClusterInfo.create({
              id: currentClusterId,
            }, configuration);

            const installationDetails = InstallationDetails.create({
              name,
              onepanelServiceType: onepanelServiceType,
              clusterInfo: thisCluster,
              initStep: clusterStep,
            });

            return installationDetails;
          });
      });
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
   * Get cluster deployment configuration for current service type
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
      camelize(`get-${shortServiceType(onepanelServiceType)}-configuration`)
    );
  },

  getClusterIps() {
    const {
      onepanelServer,
      onepanelServiceType,
    } = this.getProperties('onepanelServer', 'onepanelServiceType');
    return onepanelServer.request(
        onepanelServiceType,
        camelize(`get-${shortServiceType(onepanelServiceType)}-cluster-ips`)
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
        camelize(`modify-${shortServiceType(onepanelServiceType)}-cluster-ips`), {
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
        resolve({
          isRegistered: !!providerDetails,
          providerDetails: providerDetails,
        });
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
   * See `model:installation-details CLUSTER_INIT_STEPS` for code explaination.
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
                    // We have no exact indicator if earlier step -
                    // IPs configuration - has been finished, because it 
                    // has default values which are undistinguishable from user input
                    resolve(STEP.ZONE_IPS);
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
                    const checkDnsCheck = this
                      ._checkIsDnsCheckAcknowledged();
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
                        // We have no exact indicator if earlier step -
                        // IPs configuration - has been finished, because it 
                        // has default values which are undistinguishable from
                        // user input
                        resolve(STEP.PROVIDER_IPS);
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
          'service:deployment-manager: Getting hostnames failed'
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
