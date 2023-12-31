/**
 * An abstraction layer for getting data for content of various tabs
 *
 * @author Jakub Liput
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { Promise } from 'rsvp';
import { get } from '@ember/object';
import Service, { inject as service } from '@ember/service';

export default Service.extend({
  deploymentManager: service(),
  clusterModelManager: service(),
  userManager: service(),
  onepanelServer: service(),

  /**
   * @param {string} type
   * @param {string} id
   * @returns {Promise<Object>}
   */
  getModelFor(type, id) {
    switch (type) {
      case 'clusters':
        if (this.get('onepanelServer.isEmergency')) {
          return this.get('clusterModelManager').getCurrentClusterProxy()
            .then(currentCluster =>
              currentCluster || this.get('clusterModelManager').getNotDeployedCluster()
            );
        } else {
          return this.get('clusterModelManager').getCluster(id);
        }
      case 'users':
        return this.get('userManager').getCurrentUser().get('promise')
          .then(userDetails => {
            if (get(userDetails, 'id') !== id) {
              throw new Error('Incorrect user ID');
            } else {
              return userDetails;
            }
          });
      default:
        return new Promise((resolve, reject) => reject('No such model type: ' + type));
    }
  },
});
