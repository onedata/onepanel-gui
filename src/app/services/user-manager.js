/**
 * Provides data for routes and components that manipulates user details
 *
 * @module services/user-manager
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import { getProperties } from '@ember/object';
import { oneWay } from '@ember/object/computed';
import UserDetails from 'onepanel-gui/models/user-details';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';

export default Service.extend({
  onepanelServer: service(),
  username: oneWay('onepanelServer.username'),

  /**
   * @returns {PromiseObject<models.UserDetails>}
   */
  getCurrentUser() {
    const onepanelServer = this.get('onepanelServer');

    const fetchUserPromise = onepanelServer.getCurrentUser()
      .then(userDetails => {
        const userBasicData = getProperties(
          userDetails,
          'username',
          'userId',
          'userRole',
          'clusterPrivileges'
        );
        return UserDetails.create(userBasicData);
      });
    
    return PromiseObject.create({ promise: fetchUserPromise });
  },

  /**
   * @returns {Promise<boolean>}
   */
  checkEmergencyPassphraseIsSet() {
    return this.get('onepanelServer')
      .staticRequest('onepanel', 'getEmergencyPassphraseStatus')
      .then(({ data: { isSet } }) => isSet);
  },

  setFirstEmergencyPassphrase(passphrase) {
    return this.get('onepanelServer')
      .staticRequest('onepanel', 'setEmergencyPassphrase', [{
        newPassphrase: passphrase,
      }]);
  },
});
