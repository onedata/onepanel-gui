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

    getCluster(id) {
      return this.get('onepanelServer').request('onepanel', 'getCluster', id)
        .then(({ data }) => {
          const cluster = _.cloneDeep(data);
          // FIXME:
          cluster.name = `Hello ${id}`;
          if (cluster.type === 'onezone') {
            // cluster.domain = configuration.zoneDomain;
            return this.get('configurationManager').getClusterDetails()
              .then(currentCluster => {
                cluster.domain = get(currentCluster, 'onezone.domainName');
                return cluster;
              });
          } else {
            cluster.domain = 'example.com';
            return cluster;
            // FIXME:
            // return this.get('providerManager').getAnyProvider(cluster.providerId)
            //   .then(provider => {
            //     cluster.domain = provider.domain;
            //     return cluster;
            //   });
          }
        });
    },
  }
);
