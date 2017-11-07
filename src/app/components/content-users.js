/**
 * Implements operations on user for onepanel
 * Extends `onedata-gui-common/components/content-users`
 *
 * @module components/content-users
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

import Onepanel from 'npm:onepanel';

import ContentUsers from 'onedata-gui-common/components/content-users';
import layout from 'onedata-gui-common/templates/components/content-users';

const {
  UserModifyRequest,
} = Onepanel;

const {
  get,
  inject: { service },
} = Ember;

export default ContentUsers.extend({
  layout,

  onepanelServer: service(),

  /**
   * To inject.
   * @type {OnepanelGui.UserDetails}
   */
  user: null,

  /**
   * Make an API call to change password of current user
   * @override
   * @param {object} data
   * @param {string} data.currentPassword
   * @param {string} data.newPassword
   * @returns {Promise} resolves on change password success
   */
  _changePassword({ currentPassword, newPassword }) {
    let {
      user,
      onepanelServer,
    } = this.getProperties(
      'user',
      'onepanelServer',
    );

    return onepanelServer.request(
      'onepanel',
      'modifyUser',
      get(user, 'id'),
      UserModifyRequest.constructFromObject({
        currentPassword,
        newPassword,
      })
    );
  },

});
