/**
 * An abstraction layer for getting data for content of various tabs
 *
 * @module services/content-resources
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { Promise } from 'rsvp';

import Service, { inject as service } from '@ember/service';

export default Service.extend({
  configurationManager: service(),
  clusterModelManager: service(),
  userManager: service(),

  /**
   * @param {string} type
   * @param {string} id
   * @returns {Promise<ClusterDetails|string>}
   */
  getModelFor(type, id) {
    switch (type) {
      case 'clusters':
        return this.get('clusterModelManager').getCluster(id);
      case 'users':
        return this.get('userManager').getUserDetails(id).get('promise');

      default:
        return new Promise((resolve, reject) => reject('No such model type: ' + type));
    }
  },
});
