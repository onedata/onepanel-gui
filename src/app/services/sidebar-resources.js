/**
 * An abstraction layer for getting data for sidebar of various tabs
 *
 * @module services/sidebar-resources
 * @author Jakub Liput
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { resolve, reject } from 'rsvp';
import { inject as service } from '@ember/service';
import SidebarResources from 'onedata-gui-common/services/sidebar-resources';

export default SidebarResources.extend({
  onepanelServer: service(),
  clusterModelManager: service(),
  guiUtils: service(),
  clusterActions: service(),

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
      case 'users':
        return resolve([]);
      case 'clusters':
        if (this.get('onepanelServer.isStandalone')) {
          return this.get('clusterModelManager').getCurrentClusterProxy()
            .then(currentCluster => {
              if (currentCluster) {
                return { list: [currentCluster] };
              } else {
                // cluster is not deployed yet - only in onepanel standalone mode
                return {
                  list: [this.get('clusterModelManager').getNotDeployedCluster()],
                };
              }
            });
        } else {
          return this.get('clusterModelManager').getClustersProxy();
        }
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
      case 'clusters':
        return this.get('clusterActions.buttons');
      default:
        return [];
    }
  },
});
