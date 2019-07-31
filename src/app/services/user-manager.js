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
import Onepanel from 'npm:onepanel';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';

const {
  EmergencyPassphraseChangeRequest,
} = Onepanel;

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
    const onepanelServer = this.get('onepanelServer');

    return onepanelServer
      .staticRequest('onepanel', 'getEmergencyPassphraseStatus')
      .then(({ data: { isSet } }) => isSet);
  },

  /**
   * @param {string} passphrase 
   * @returns {Promise}
   */
  setFirstEmergencyPassphrase(passphrase) {
    const onepanelServer = this.get('onepanelServer');

    const requestData = EmergencyPassphraseChangeRequest.constructFromObject({
      newPassphrase: passphrase,
    });
    return onepanelServer
      .staticRequest('onepanel', 'setEmergencyPassphrase', [requestData]);
  },

  /**
   * @param {string} currentPassphrase
   * @param {string} newPassphrase
   * @returns {Promise}
   */
  changeEmergencyPassphrase(currentPassphrase, newPassphrase) {
    const onepanelServer = this.get('onepanelServer');
    
    const requestData = EmergencyPassphraseChangeRequest.constructFromObject({
      currentPassphrase,
      newPassphrase,
    });
    return onepanelServer.request(
      'onepanel',
      'setEmergencyPassphrase',
      requestData
    );
  },
});
