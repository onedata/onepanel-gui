/**
 * Provides data for everything associated with Clusters
 *
 * @module services/cluster-model-manager
 * @author Jakub Liput
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import { get, set } from '@ember/object';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import _ from 'lodash';
import { resolve } from 'rsvp';

export default Service.extend(
  createDataProxyMixin('rawCurrentCluster'),
  createDataProxyMixin('currentCluster'),
  createDataProxyMixin('clusterIds'),
  createDataProxyMixin('clusters'), {
    onepanelServer: service(),
    guiUtils: service(),
    onepanelConfiguration: service(),
    providerManager: service(),
    deploymentManager: service(),

    fetchRawCurrentCluster() {
      return this.get('onepanelServer').request('onepanel', 'getCurrentCluster')
        .then(({ data }) => data)
        .catch(error => {
          if (error && error.response && error.response.statusCode === 404) {
            return null;
          } else {
            throw error;
          }
        });
    },

    fetchCurrentCluster() {
      return this.getRawCurrentClusterProxy()
        .then(cluster => cluster && this.generateGuiCluster(cluster, true));
    },

    fetchClusterIds() {
      return this.get('onepanelServer').request('onepanel', 'getClusters')
        .then(({ data }) => data.ids);
    },

    fetchClusters() {
      return this.getClusterIdsProxy().then(ids =>
        Promise.all(ids.map(id => this.getCluster(id)))
      );
    },

    getNotDeployedCluster() {
      const type = this.get('guiUtils.serviceType');
      return {
        id: 'new-cluster',
        name: 'New cluster',
        domain: location.hostname,
        type,
        isLocal: true,
        isNotDeployed: true,
      };
    },

    getCluster(id) {
      return this.get('onepanelServer').request('onepanel', 'getCluster', id)
        .then(({ data }) => this.generateGuiCluster(data));
    },

    /**
     * Adds missing name, domain, isLocal and isNotDeployed fields to cluster
     * records fetched from backend 
     * @param {Onepanel.ClusterDetails} data cluster data from backend(REST)
     * @param {string} data.id
     * @param {string} data.type
     * @param {string} data.serviceId
     * @param {string} data.version
     * @param {string} data.build
     * @param {boolean} data.proxy
     * @param {boolean} [assumeItIsLocal=false]
     * @returns {Promise}
     */
    generateGuiCluster(data, assumeItIsLocal = false) {
      const {
        deploymentManager,
        providerManager,
      } = this.getProperties('deploymentManager', 'providerManager');
      const onepanelGuiType = this.get('guiUtils.serviceType');

      const cluster = _.cloneDeep(data);
      let installationDetailsProxy;

      return (assumeItIsLocal ? resolve(cluster) : this.getCurrentClusterProxy())
        .then(currentCluster => {
          if (get(currentCluster, 'id') === get(cluster, 'id')) {
            set(cluster, 'isLocal', true);
            installationDetailsProxy =
              deploymentManager.getInstallationDetails(false);
            return installationDetailsProxy.then(installationDetails => {
              set(
                cluster,
                'isNotDeployed',
                !get(installationDetails, 'isInitialized')
              );
            });
          } else {
            set(cluster, 'isLocal', false);
          }
        })
        .then(() => {
          if (cluster.type === 'onezone') {
            if (onepanelGuiType === 'onezone') {
              installationDetailsProxy = installationDetailsProxy ||
                deploymentManager.getInstallationDetails(false);
              return installationDetailsProxy
                .then(installationDetails => {
                  cluster.name = get(installationDetails, 'name');
                  cluster.domain = get(installationDetails, 'onezone.domainName');
                  return cluster;
                });
            } else {
              return providerManager.getOnezoneInfo()
                .then(onezoneInfo => {
                  cluster.name = get(onezoneInfo, 'name');
                  cluster.domain = get(onezoneInfo, 'domain');
                  return cluster;
                });
            }
          } else {
            return providerManager.getRemoteProvider(get(data, 'serviceId'))
              .then(({ name, domain }) => {
                cluster.name = name;
                cluster.domain = domain;
                return cluster;
              });
          }
        });
    },
  }
);
