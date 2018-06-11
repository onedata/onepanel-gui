/**
 * Provides data for routes and components that manipulates user details
 *
 * @module services/user-manager
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
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
    return this.getUserDetails(this.get('username'));
  },

  getUserDetails(username) {
    let user = this.get('onepanelServer')
      .request('onepanel', 'getUser', username)
      .then(({ data }) => UserDetails.create({
        username: username,
        userId: data.userId,
        userRole: data.userRole,
      }));
    return PromiseObject.create({ promise: user });
  },

  getUsers() {
    let promise = new Promise(resolve => {
      resolve(A([this.getCurrentUser()]));
    });
    return PromiseObject.create({ promise });
  },

  /**
   * @returns {Promise<boolean|any>}
   */
  checkAdminUserExists() {
    return this.get('onepanelServer')
      .staticRequest('onepanel', 'getUsers', [{ role: 'admin' }])
      .then(({ data: { usernames } }) => usernames.length > 0)
      .catch(error => {
        if (error.response.statusCode === 403) {
          return true;
        } else {
          throw error;
        }
      });
  },

  /**
   * Create Panel user
   * @param {string} username 
   * @param {string} password 
   * @param {string} userRole one of: admin, regular
   * @returns {Promise<undefined|any>}
   */
  addUser(username, password, userRole) {
    const userCreateRequest = {
      username,
      password,
      userRole,
    };

    return this.get('onepanelServer')
      .staticRequest('onepanel', 'addUser', [userCreateRequest]);
  },
});
