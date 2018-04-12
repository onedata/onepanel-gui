/**
 * An abstraction layer for getting data for sidebar of various tabs
 *
 * @module services/sidebar-resources
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { Promise } from 'rsvp';
import { inject as service } from '@ember/service';
import SidebarResources from 'onedata-gui-common/services/sidebar-resources';

export default SidebarResources.extend({
  clusterManager: service(),
  userManager: service(),

  /**
   * @param {string} type
   * @returns {Promise}
   */
  getCollectionFor(type) {
    switch (type) {
      case 'clusters':
        return this.get('clusterManager').getClusters().get('promise');
      case 'users':
        return this.get('userManager').getUsers().get('promise').then(users => {
          return Promise.resolve({ list: users });
        });
      default:
        return new Promise((resolve, reject) => reject('No such collection: ' + type));
    }
  },

  /**
   * Returns sidebar buttons definitions
   * @param {string} type
   * @returns {Array<object>}
   */
  getButtonsFor(type) {
    switch (type) {
      default: return [];
    }
  },
});
