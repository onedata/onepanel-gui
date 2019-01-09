/**
 * An abstraction layer for getting data for sidebar of various tabs
 *
 * @module services/sidebar-resources
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { resolve, reject } from 'rsvp';
import { inject as service } from '@ember/service';
import SidebarResources from 'onedata-gui-common/services/sidebar-resources';

export default SidebarResources.extend({
  onepanelServer: service(),
  configurationManager: service(),
  clusterModelManager: service(),
  userManager: service(),
  guiUtils: service(),

  /**
   * @param {string} type
   * @returns {Promise}
   */
  getCollectionFor(type) {
    switch (type) {
      case 'data':
      case 'spaces':
      case 'groups':
      case 'tokens':
        return resolve([]);
      case 'clusters':
        if (this.get('onepanelServer').getClusterIdFromUrl() ||
          this.get('guiUtils.serviceType') === 'zone') {
          return this.get('clusterModelManager').getClustersProxy();
        } else {
          return this.get('clusterModelManager').getCurrentClusterProxy()
            .then(currentCluster => {
              if (currentCluster) {
                return { list: [currentCluster] };
              } else {
                // cluster is not deployed yet - only in op-panel standalone mode
                return {
                  list: [this.get('clusterModelManager').getNotDeployedCluster()],
                };
              }
            });
        }
      case 'users':
        return this.get('userManager').getUsers().get('promise').then(users => {
          return resolve({ list: users });
        });
      default:
        return reject('No such collection: ' + type);
    }
  },

  /**
   * Returns sidebar buttons definitions
   * @param {string} type
   * @returns {Array<object>}
   */
  getButtonsFor(type) {
    switch (type) {
      default:
        return [];
    }
  },
});
