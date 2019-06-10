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
import { get } from '@ember/object';
import SidebarResources from 'onedata-gui-common/services/sidebar-resources';

export default SidebarResources.extend({
  onepanelServer: service(),
  clusterModelManager: service(),
  guiUtils: service(),
  clusterActions: service(),

  /**
   * @param {string} type
   * @returns {Promise|PromiseObject|PromiseArray}
   */
  getCollectionFor(type) {
    switch (type) {
      case 'providers':
      case 'spaces':
      case 'groups':
      case 'tokens':
      case 'harvesters':
      case 'users': {
        return resolve([]);
      }
      case 'clusters': {
        const {
          onepanelServer,
          clusterModelManager,
        } = this.getProperties('onepanelServer', 'clusterModelManager');
        if (get(onepanelServer, 'isEmergency')) {
          return clusterModelManager.getCurrentClusterProxy()
            .then(currentCluster => {
              if (currentCluster) {
                return resolve([currentCluster]);
              } else {
                // cluster is not deployed yet - only in onepanel emergency mode
                return resolve([clusterModelManager.getNotDeployedCluster()]);
              }
            });
        } else {
          return clusterModelManager.getClustersProxy();
        }
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
