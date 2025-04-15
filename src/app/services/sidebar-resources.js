/**
 * Implements resources for Onepanel GUI sidebar.
 *
 * @author Jakub Liput
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { inject as service } from '@ember/service';
import SidebarResources from 'onedata-gui-common/services/sidebar-resources';
import SidebarModelLoader from 'onedata-gui-common/utils/sidebar-model-loader';

/** @type {SidebarCollection} */
const emptyCollection = Object.freeze({
  get array() {
    return [];
  },
  get ids() {
    return [];
  },
});

export default class SidebarResourcesService extends SidebarResources {
  @service onepanelServer;
  @service clusterModelManager;
  @service guiUtils;
  @service clusterActions;

  /**
   * @override
   * @param {OnedataResourceCategory} resourceCategory
   * @returns {SidebarModelLoader}
   */
  createSidebarModelLoader(resourceCategory) {
    switch (resourceCategory) {
      case 'clusters':
        return this.createClustersSidebarModelLoader();
      case 'providers':
      case 'spaces':
      case 'shares':
      case 'groups':
      case 'tokens':
      case 'harvesters':
      case 'atm-inventories':
      case 'users': {
        return this.createEmptySidebarModelLoader();
      }
      default:
        throw new Error(`SidebarResources: no such collection: ${resourceCategory}`);
    }
  }

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
  }

  /**
   * @private
   * @returns {SidebarModelLoader}
   */
  createClustersSidebarModelLoader() {
    const {
      onepanelServer,
      clusterModelManager,
    } = this;
    let arrayResolver;
    if (onepanelServer.isEmergency) {
      arrayResolver = async () => {
        const currentCluster = await clusterModelManager.getCurrentClusterProxy();
        if (currentCluster) {
          return [currentCluster];
        } else {
          // cluster is not deployed yet - only in onepanel emergency mode
          return [clusterModelManager.getNotDeployedCluster()];
        }
      };
    } else {
      arrayResolver = async () => {
        return await clusterModelManager.getClustersProxy();
      };
    }
    const collectionResolver = async () => {
      const array = await arrayResolver();
      return {
        get array() {
          return array;
        },
        get ids() {
          return this.array.map(cluster => cluster.id);
        },
      };
    };
    return new SidebarModelLoader('clusters', collectionResolver());
  }

  /**
   * @private
   * @returns {SidebarModelLoader}
   */
  createEmptySidebarModelLoader() {
    const collectionResolver = async () => emptyCollection;
    return new SidebarModelLoader('clusters', collectionResolver());
  }
}
