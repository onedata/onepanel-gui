/**
 * Provides data for routes and components that manipulates user details
 *
 * @module services/user-manager
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import UserDetails from 'onepanel-gui/models/user-details';

const {
  Service,
  inject: { service },
  RSVP: { Promise },
  ObjectProxy,
  PromiseProxyMixin,
  A,
  computed: { oneWay },
} = Ember;

const ObjectPromiseProxy = ObjectProxy.extend(PromiseProxyMixin);

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
    return ObjectPromiseProxy.create({ promise: user });
  },

  getUsers() {
    let promise = new Promise(resolve => {
      resolve(A([this.getCurrentUser()]));
    });
    return ObjectPromiseProxy.create({ promise });
  },
});