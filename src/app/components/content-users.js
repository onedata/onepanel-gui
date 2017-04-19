/**
 * Main view for single user account
 *
 * @module components/content-users
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import Onepanel from 'npm:onepanel';

const {
  Component,
  inject: { service },
  computed,
} = Ember;

const {
  UserModifyRequest,
} = Onepanel;

export default Component.extend({
  onepanelServer: service(),
  globalNotify: service(),

  /**
   * To inject.
   * @type {OnepanelGui.UserDetails}
   */
  user: null,

  _changingPassword: false,

  // TODO i18n  
  _changePasswordButtonLabel: computed('_changingPassword', function () {
    return this.get('_changingPassword') ?
      'Cancel password change' :
      'Change password';
  }),

  _changePasswordButtonType: computed('_changingPassword', function () {
    return this.get('_changingPassword') ? 'default' : 'primary';
  }),

  actions: {
    toggleChangePassword() {
      this.toggleProperty('_changingPassword');
    },

    /**
     * Make an API call to change password of current user
     * 
     * @param {object} { oldPassword: string, newPassword: string }
     * @returns {Promise} an API call promise
     */
    submitChangePassword({ currentPassword, newPassword }) {
      let {
        user,
      } = this.getProperties(
        'user'
      );
      let changingPassword = this.get('onepanelServer').request(
        'onepanel',
        'modifyUser',
        user.get('id'),
        UserModifyRequest.constructFromObject({
          currentPassword,
          newPassword,
        })
      );

      // TODO i18n
      changingPassword.catch(({ message, response: { body: { description } } }) =>
        this.get('globalNotify').error(
          `Failed changing password: ${description || message}`
        )
      );

      changingPassword.then(() =>
        this.get('globalNotify').info(`Password changed sucessfully`)
      );

      return changingPassword;
    },
  }
});
