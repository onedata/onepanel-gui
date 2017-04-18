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
    submitChangePassword({ oldPassword, newPassword }) {
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
          // TODO a future parameter for onepanel API
          currentPassword: oldPassword,
          password: newPassword
        })
      );

      // TODO i18n
      changingPassword.catch(error =>
        this.get('globalNotify').error(`Failed changing password: ${error}`)
      );

      changingPassword.then(() =>
        this.get('globalNotify').info(`Password changed sucessfully`)
      );

      return changingPassword;
    },
  }
});
