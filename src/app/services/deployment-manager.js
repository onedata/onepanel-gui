/**
 * Provides data for routes and components assoctiated with deployment of cluster
 *
 * @module services/deployment-manager
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';

import { resolve } from 'rsvp';
import { get } from '@ember/object';
import { reads, alias } from '@ember/object/computed';
import ObjectProxy from '@ember/object/proxy';
import { camelize, capitalize } from '@ember/string';
import ClusterInfo from 'onepanel-gui/models/cluster-info';
import InstallationDetails, { installationStepsMap } from 'onepanel-gui/models/installation-details';
import ClusterHostInfo from 'onepanel-gui/models/cluster-host-info';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import shortServiceType from 'onepanel-gui/utils/short-service-type';
import { extractHostsFromCephConfiguration } from 'onepanel-gui/utils/ceph/cluster-configuration';
import _ from 'lodash';
import { getOwner } from '@ember/application';

const _ROLE_COLLECTIONS = {
  databases: 'database',
  managers: 'clusterManager',
  workers: 'clusterWorker',
  ceph: 'ceph',
};

export default Service.extend(createDataProxyMixin('installationDetails'), {
  clusterModelManager: service(),
  onepanelServer: service(),
  guiUtils: service(),
  cephManager: service(),
  i18n: service(),
  onepanelConfiguration: service(),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
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
    const {
      onepanelServiceType,
      cephManager,
      clusterModelManager,
    } = this.getProperties('onepanelServiceType', 'cephManager', 'clusterModelManager');

    let clusterStep, hasCephDeployed;

    return this._getThisClusterInitStep()
      .then(step => {
        clusterStep = step;
        return onepanelServiceType === 'oneprovider' ?
          cephManager.isDeployed() : resolve(false);
      })
      .then(hasCeph => {
        hasCephDeployed = hasCeph;

        return this.getClusterConfiguration()
          .then(({ data: configuration }) => configuration)
          .catch(() => null);
      })
      .then(configuration => {
        return clusterModelManager.getRawCurrentClusterProxy()
          .then(currentCluster => {
            const currentClusterId = (
              currentCluster && get(currentCluster, 'id') || 'new'
            );
            const name = (configuration || null) &&
              configuration[onepanelServiceType].name;
            const thisCluster = ClusterInfo.create({
              id: currentClusterId,
            }, configuration);

            const installationDetails = InstallationDetails.create(
              getOwner(this).ownerInjection(), {
                name,
                onepanelServiceType: onepanelServiceType,
                clusterInfo: thisCluster,
                initStep: clusterStep,
                hasCephDeployed,
              }
            );

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
    return this.getClusterConfiguration(true)
      .then(({ data: { cluster, ceph } }) =>
        this._clusterConfigurationToHostsInfo(cluster, ceph)
      );
  },

  /**
   * Converts response data from API about clusters to array of ``ClusterHostInfo``
   * @param {object} cluster cluster attribute of GET configuration from API
   * @param {object|undefined} ceph ceph attribute of GET configuration from API
   * @returns {object}
   *  { mainManagerHostname: string, clusterHostsInfo: Array.ClusterHostInfo }
   */
  _clusterConfigurationToHostsInfo(cluster, ceph) {
    const types = ['databases', 'managers', 'workers', 'ceph'];
    const services = _.assign({
      ceph: {
        hosts: extractHostsFromCephConfiguration(ceph),
      },
    }, cluster);

    // maps: host -> ClusterHostInfo
    const clusterHostsInfo = {};
    types.forEach(type => {
      services[type].hosts.forEach(host => {
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
   * @param {boolean} [validateData=false] if true, make validation of cluster
   *   configuration
   * @returns {Promise} result of GET configuration request
   */
  getClusterConfiguration(validateData = false) {
    const {
      onepanelServer,
      onepanelServiceType,
    } = this.getProperties(
      'onepanelServer',
      'onepanelServiceType'
    );
    let requestFun =
      (validateData ? onepanelServer.requestValidData : onepanelServer.request)
      .bind(onepanelServer);
    return requestFun(
      clusterApiName(onepanelServiceType),
      camelize(`get-${shortServiceType(onepanelServiceType)}-configuration`)
    );
  },

  getClusterIps() {
    const {
      onepanelServer,
      onepanelServiceType,
    } = this.getProperties('onepanelServer', 'onepanelServiceType');
    return onepanelServer.request(
        clusterApiName(onepanelServiceType),
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
        clusterApiName(onepanelServiceType),
        camelize(`modify-${shortServiceType(onepanelServiceType)}-cluster-ips`), {
          hosts: hostsData,
        },
      )
      .then(({ data }) => data);
  },

  /**
   * @param {OnepanelServer} onepanelServer
   * @returns {Promise}
   */
  _checkIsAnyStorage(onepanelServer) {
    return onepanelServer.request('StoragesApi', 'getStorages')
      .then(({ data: { ids } }) => ids != null && ids.length > 0)
      .catch((error) => {
        if (error && error.status === 503) {
          return true;
        } else {
          throw error;
        }
      });
  },

  _checkIsIpsConfigured() {
    return this.getClusterIps().then(({ isConfigured }) => isConfigured);
  },

  _checkIsDnsCheckAcknowledged() {
    return this.get('onepanelServer')
      .request('DNSApi', 'getDnsCheckConfiguration')
      .then(({ data }) => data.dnsCheckAcknowledged);
  },

  /**
   * The promise resolves with initial cluster deployment step, that
   * should be opened for this cluster.
   * See `model:installation-details` for code explaination.
   * @param {Promise} clusterConfigurationPromise
   * @returns {Promise}
   */
  _getThisClusterInitStep() {
    let {
      onepanelServer,
      onepanelServiceType,
      onepanelConfiguration,
    } = this.getProperties(
      'onepanelServer',
      'onepanelServiceType',
      'onepanelConfiguration'
    );

    const isConfigurationDone = get(onepanelConfiguration, 'deployed');

    if (isConfigurationDone) {
      if (onepanelServiceType === 'onezone') {
        return this._checkIsIpsConfigured().then(isIpsConfigured => {
          if (isIpsConfigured) {
            return this._checkIsDnsCheckAcknowledged().then(dnsCheckAck => {
              if (dnsCheckAck) {
                return resolve(installationStepsMap.done);
              } else {
                // We have no exact indicator if earlier step -
                // IPs configuration - has been finished, because it 
                // has default values which are undistinguishable from user input
                return resolve(installationStepsMap.ips);
              }
            });
          } else {
            return resolve(installationStepsMap.ips);
          }
        });
      } else {
        const isProviderRegistered = this.get('onepanelConfiguration.isRegistered');
        if (isProviderRegistered) {
          return this._checkIsIpsConfigured().then(isIpsConfigured => {
            if (isIpsConfigured) {
              return this._checkIsDnsCheckAcknowledged().then(dnsCheckAck => {
                if (dnsCheckAck) {
                  return this._checkIsAnyStorage(onepanelServer)
                    .then(isAnyStorage => {
                      if (isAnyStorage) {
                        return resolve(installationStepsMap.done);
                      } else {
                        return resolve(
                          installationStepsMap.oneproviderStorageAdd
                        );
                      }
                    });
                } else {
                  // We have no exact indicator if earlier step -
                  // IPs configuration - has been finished, because it 
                  // has default values which are undistinguishable from
                  // user input
                  return resolve(installationStepsMap.ips);
                }
              });
            } else {
              return resolve(installationStepsMap.ips);
            }
          });
        } else {
          return resolve(installationStepsMap.oneproviderRegistration);
        }
      }
    } else {
      return resolve(installationStepsMap.deploy);
    }
  },

  /**
   * @param {string} type
   * @return {Promise} resolves with Array.{ hostname: string }
   */
  getHosts(type = 'known') {
    return this.getHostNames(type).then(({ data: hostnames }) => {
      return hostnames.map(hostname => ({
        hostname,
      }));
    }).catch(error => {
      console.error(
        'service:deployment-manager: Getting hostnames failed'
      );
      throw error;
    });
  },

  /**
   * @param {string} type one of: known, cluster
   * @returns {Promise}
   */
  getHostNames() {
    return this.get('onepanelServer').requestValidData(
      'ClusterApi',
      'getClusterHosts',
    );
  },

  /**
   * @param {string} address hostname or IP address
   * @returns {Promise<Onepanel.KnownHost>}
   */
  addKnownHost(address) {
    return this.get('onepanelServer').request(
      'ClusterApi',
      'addClusterHost', { address }
    ).then(({ data }) => data);
  },
});

function clusterApiName(onepanelServiceType) {
  return capitalize(onepanelServiceType) + 'ClusterApi';
}
