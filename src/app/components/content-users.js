import Ember from 'ember';
import Onepanel from 'npm:onepanel';

const {
  Component,
  inject: { service },
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

  _editingPassword: false,

  currentPassword: null,
  newPassword: null,
  retypedNewPassword: null,

  actions: {
    startChangePassword() {
      this.set('_editingPassword', true);
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
