/**
 * Provides data for routes and components that manipulates user details
 *
 * @module services/user-manager
 * @author Jakub Liput
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';

import { Promise } from 'rsvp';
import { A } from '@ember/array';
import { oneWay } from '@ember/object/computed';
import UserDetails from 'onepanel-gui/models/user-details';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';

export default Service.extend({
  onepanelServer: service(),
  username: oneWay('onepanelServer.username'),

  getCurrentUser() {
    // FIXME: will not work in emergency
    return this.getUserDetails(this.get('username'));
  },

  // FIXME: unneeded abstraction?
  getUserDetails(username) {
    let user = this.get('onepanelServer')
      .request('onepanel', 'getCurrentUser')
      .then(({ data }) => UserDetails.create({
        username: username,
        userId: data.userId,
        userRole: data.userRole,
      }));
    return PromiseObject.create({ promise: user });
  },

  // FIXME: not avail now
  getUsers() {
    let promise = new Promise(resolve => {
      resolve(A([this.getCurrentUser()]));
    });
    return PromiseObject.create({ promise });
  },

  /**
   * @returns {Promise<boolean>}
   */
  checkAdminUserExists() {
    return this.get('onepanelServer')
      .staticRequest('onepanel', 'getRootPasswordStatus')
      .then(({ data: { isSet } }) => isSet);
  },

  setFirstRootPassword(password) {
    return this.get('onepanelServer')
      .staticRequest('onepanel', 'setRootPassword', [{
        newPassword: password,
      }]);
  },
});
