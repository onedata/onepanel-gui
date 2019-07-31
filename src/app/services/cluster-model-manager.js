/**
 * Provides data for everything associated with Clusters
 *
 * @module services/cluster-model-manager
 * @author Jakub Liput
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import { get, set } from '@ember/object';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import _ from 'lodash';
import { resolve } from 'rsvp';
import addConflictLabels from 'onedata-gui-common/utils/add-conflict-labels';
import Cluster from 'onepanel-gui/models/cluster';
import { getOwner } from '@ember/application';

const GuiOneproviderCluster = Cluster.extend({
  name: reads('providerManager.providerDetails.name').readOnly(),
  domain: reads('providerManager.providerDetails.domain').readOnly(),

  init() {
    this._super(...arguments);
    this.get('providerManager').getProviderDetailsProxy();
  },
});

export default Service.extend(
  createDataProxyMixin('rawCurrentCluster'),
  createDataProxyMixin('currentCluster'),
  createDataProxyMixin('clusterIds'),
  createDataProxyMixin('clusters', { type: 'array' }), {
    onepanelServer: service(),
    guiUtils: service(),
    onepanelConfiguration: service(),
    providerManager: service(),
    deploymentManager: service(),
    i18n: service(),

    /**
     * @override
     * The raw ClusterDetails object from REST backend.
     * For Cluster model that is used as a resource in frontend, it is processed
     * in `generateGuiCluster` method.
     * @returns {Onepanel.ClusterDetails}
     */
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

    /**
     * @override
     */
    fetchCurrentCluster() {
      return this.getRawCurrentClusterProxy()
        .then(cluster => cluster && this.generateGuiCluster(cluster, true));
    },

    /**
     * @override
     */
    fetchClusterIds() {
      return this.get('onepanelServer').request('onepanel', 'getClusters')
        .then(({ data }) => data.ids);
    },

    /**
     * @override
     */
    fetchClusters() {
      return this.getClusterIdsProxy({ reload: true })
        .then(ids => Promise.all(ids.map(id => this.getCluster(id))))
        .then(clusters => addConflictLabels(clusters));
    },

    /**
     * Creates fake Cluster record for use in frontend when there is no cluster
     * at all when installing.
     * @returns {Object} something like result of `generateGuiCluster`
     *  but without some fields
     */
    getNotDeployedCluster() {
      const type = this.get('guiUtils.serviceType');
      const i18n = this.get('i18n');
      return {
        id: 'new-cluster',
        name: i18n.t('services.clusterModelManager.newCluster'),
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

      let cluster = _.cloneDeep(data);
      let installationDetailsProxy;

      return (assumeItIsLocal ? resolve(cluster) : this.getCurrentClusterProxy())
        .then(currentCluster => {
          if (get(currentCluster, 'id') === get(cluster, 'id')) {
            set(cluster, 'isLocal', true);
            installationDetailsProxy =
              deploymentManager.getInstallationDetailsProxy();
            return installationDetailsProxy.then(installationDetails => {
              set(cluster, 'installationDetails', installationDetails);
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
          if (get(cluster, 'type') === 'onezone') {
            if (onepanelGuiType === 'onezone') {
              installationDetailsProxy = installationDetailsProxy ||
                deploymentManager.getInstallationDetailsProxy();
              return installationDetailsProxy
                .then(installationDetails => {
                  set(cluster, 'installationDetails', installationDetails);
                  set(cluster, 'name', get(installationDetails, 'name'));
                  set(
                    cluster,
                    'domain',
                    get(installationDetails, 'onezone.domainName')
                  );
                  return cluster;
                });
            } else {
              return providerManager.getOnezoneInfo()
                .then(onezoneInfo => {
                  set(cluster, 'name', get(onezoneInfo, 'name'));
                  set(cluster, 'domain', get(onezoneInfo, 'domain'));
                  return cluster;
                });
            }
          } else {
            if (get(cluster, 'isLocal')) {
              cluster = GuiOneproviderCluster.create(
                Object.assign({ providerManager }, cluster)
              );
              return cluster;
            } else {
              return providerManager.getRemoteProvider(get(data, 'serviceId'))
                .then(({ name, domain }) => {
                  set(cluster, 'name', name);
                  set(cluster, 'domain', domain);
                  return cluster;
                });
            }
          }
        })
        .then(cluster =>
          cluster instanceof Cluster ? cluster : Cluster.create(
            getOwner(this).ownerInjection(),
            cluster
          )
        );
    },
  }
);
