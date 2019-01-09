/**
 * Provides data for everything associated with Clusters
 *
 * @module services/cluster-model-manager
 * @author Jakub Liput
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import { get } from '@ember/object';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import _ from 'lodash';
import { resolve } from 'rsvp';

export default Service.extend(
  createDataProxyMixin('currentCluster'),
  createDataProxyMixin('clusterIds'),
  createDataProxyMixin('clusters'), {
    onepanelServer: service(),
    onepanelConfiguration: service(),
    providerManager: service(),
    configurationManager: service(),

    fetchCurrentCluster() {
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
      const type = 'one' + this.get('onepanelServer.serviceType');
      return {
        id: 'new',
        name: 'New cluster',
        domain: location.hostname,
        type,
      };
    },

    getCluster(id) {
      return this.get('onepanelServer').request('onepanel', 'getCluster', id)
        .then(({ data }) => this.generateGuiCluster(data));
    },

    /**
     * Adds missing name and domain fields to cluster records fetched from backend 
     * @param {Onepanel.ClusterDetails} data cluster data from backend(REST)
     * @param {string} data.id
     * @param {string} data.type
     * @param {string} data.serviceId
     * @param {string} data.version
     * @param {string} data.build
     * @param {boolean} data.proxy
     * @returns {Promise}
     */
    generateGuiCluster(data) {
      const cluster = _.cloneDeep(data);
      const onepanelGuiType = this.get('onepanelServer.serviceType');
      if (cluster.type === 'onezone') {
        if (onepanelGuiType === 'zone') {
          return this.get('configurationManager').getInstallationDetails()
            .then(currentCluster => {
              cluster.name = get(currentCluster, 'name');
              cluster.domain = get(currentCluster, 'onezone.domainName');
              return cluster;
            });
        } else {
          return this.get('providerManager').getOnezoneInfo()
            .then(onezoneInfo => {
              cluster.name = get(onezoneInfo, 'name');
              cluster.domain = get(onezoneInfo, 'domain');
              return cluster;
            });
        }
      } else {
        return this.get('providerManager').getAnyProvider(get(data, 'serviceId'))
          .then(({ name, domain }) => {
            cluster.name = name;
            cluster.domain = domain;
            return cluster;
          });
      }
    },
  }
);
