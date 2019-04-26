/**
 * Implements root password change operation
 * 
 * @module components/content-clusters-root-password
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import Onepanel from 'npm:onepanel';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

const {
  RootPasswordChangeRequest,
} = Onepanel;

export default Component.extend(I18n, {
  classNames: ['content-cluster-root-password'],

  i18n: service(),
  globalNotify: service(),
  onepanelServer: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentClustersRootPassword',

  /**
   * If true, set credentials form to changingPassword mode
   * @type {boolean}
   */
  _changingPassword: false,

  _changePasswordButtonLabel: computed('_changingPassword', function () {
    return this.get('_changingPassword') ?
      this.t('cancelChangePassword') :
      this.t('changePassword');
  }),

  _changePasswordButtonType: computed('_changingPassword', function () {
    return this.get('_changingPassword') ? 'default' : 'primary';
  }),

  _changePasswordButtonClass: computed('_changingPassword', function () {
    return this.get('_changingPassword') ?
      'btn-change-password-cancel' : 'btn-change-password-start';
  }),

  /**
   * Make an API call to change root password
   * @override
   * @param {object} data
   * @param {string} data.currentPassword
   * @param {string} data.newPassword
   * @returns {Promise} resolves on change password success
   */
  _changePassword({ currentPassword, newPassword }) {
    const onepanelServer = this.get('onepanelServer');

    return onepanelServer.request(
      'onepanel',
      'setRootPassword',
      RootPasswordChangeRequest.constructFromObject({
        currentPassword,
        newPassword,
      })
    );
  },

  actions: {
    toggleChangePassword() {
      this.toggleProperty('_changingPassword');
    },

    /**
     * Make an API call to change root password and handles promise
     * resolve, reject
     * 
     * @param {object} { currentPassword: string, newPassword: string }
     * @returns {Promise} an API call promise, resolves on change password success
     */
    submitChangePassword({ currentPassword, newPassword }) {
      const globalNotify = this.get('globalNotify');

      let changingPassword = this._changePassword({ currentPassword, newPassword });

      changingPassword.catch(error => {
        globalNotify.backendError(this.t('passwordChangeErrorType'), error);
      });

      changingPassword.then(() => {
        globalNotify.info(this.t('passwordChangedSuccess'));
        safeExec(this, 'set', '_changingPassword', false);
      });

      return changingPassword;
    },
  },
});
