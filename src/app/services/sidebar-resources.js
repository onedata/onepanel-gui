/**
 * An abstraction layer for getting data for sidebar of various tabs
 *
 * @module services/sidebar-resources
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

const {
  RSVP: {
    Promise,
  },
  inject: {
    service,
  },
} = Ember;

export default Ember.Service.extend({
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
        return this.get('userManager').getUsers().get('promise');
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
      default:
        return [];
    }
  },
});
