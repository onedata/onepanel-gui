/**
 * An abstraction layer for getting data for sidebar of various tabs
 *
 * @author Jakub Liput
 * @copyright (C) 2017-2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { reject } from 'rsvp';
import { inject as service } from '@ember/service';
import SidebarResources from 'onedata-gui-common/services/sidebar-resources';

/** @type {SidebarCollection} */
const emptyCollection = Object.freeze({
  get array() {
    return [];
  },
  get ids() {
    return [];
  },
});

export default SidebarResources.extend({
  onepanelServer: service(),
  clusterModelManager: service(),
  guiUtils: service(),
  clusterActions: service(),

  /**
   * @override
   * @param {string} type
   * @returns {Promise<SidebarCollection>}
   */
  async getCollectionFor(type) {
    switch (type) {
      case 'providers':
      case 'spaces':
      case 'shares':
      case 'groups':
      case 'tokens':
      case 'harvesters':
      case 'atm-inventories':
      case 'users': {
        return emptyCollection;
      }
      case 'clusters': {
        const {
          onepanelServer,
          clusterModelManager,
        } = this;
        let array;
        if (onepanelServer.isEmergency) {
          const currentCluster = clusterModelManager.getCurrentClusterProxy();
          if (currentCluster) {
            // FIXME: przetestować
            array = [currentCluster];
          } else {
            // FIXME: przetestować
            // cluster is not deployed yet - only in onepanel emergency mode
            array = [clusterModelManager.getNotDeployedCluster()];
          }
        } else {
          array = await clusterModelManager.getClustersProxy();
        }
        return {
          get array() {
            return array;
          },
          get ids() {
            return this.array.map(cluster => cluster.id);
          },
        };
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
