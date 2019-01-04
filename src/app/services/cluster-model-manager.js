/**
 * Provides data for everything associated with Clusters
 *
 * @module services/cluster-model-manager
 * @author Jakub Liput
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';

export default Service.extend(
  createDataProxyMixin('currentCluster'),
  createDataProxyMixin('clusterIds'),
  createDataProxyMixin('clusters'), {
    onepanelServer: service(),

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
        .then(({ data }) => data);
    },
  }
);
