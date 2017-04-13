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

  currentPassword: null,
  newPassword: null,
  retypedNewPassword: null,

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
    submitChangePassword() {
      let {
        user,
        // currentPassword,
        newPassword,
        // retypedNewPassword,
      } = this.getProperties(
        'user',
        'currentPassword',
        'newPassword',
        'retypedNewPassword'
      );
      // FIXME validation check
      let changingPassword = this.get('onepanelServer').request(
        'onepanel',
        'modifyUser',
        user.get('id'),
        UserModifyRequest.constructFromObject({
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
