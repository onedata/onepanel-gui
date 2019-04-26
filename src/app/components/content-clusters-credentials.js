/**
 * Implements operations on user for onepanel
 * 
 * @module components/content-clusters-credentials
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { get, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Onepanel from 'npm:onepanel';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

const {
  UserModifyRequest,
} = Onepanel;

export default Component.extend({
  classNames: ['content-cluster-credentials'],

  i18n: service(),
  globalNotify: service(),
  userManager: service(),
  onepanelServer: service(),

  /**
   * @type {OnepanelGui.UserDetails}
   */
  userProxy: computed(function userProxy() {
    // FIXME: will not work in emergency mode
    return this.get('userManager').getCurrentUser();
  }),

  /**
   * If true, set credentials form to changingPassword mode
   * @type {boolean}
   */
  _changingPassword: false,

  _changePasswordButtonLabel: computed('_changingPassword', function () {
    let i18n = this.get('i18n');
    return this.get('_changingPassword') ?
      i18n.t('components.contentClustersCredentials.cancelChangePassword') :
      i18n.t('components.contentClustersCredentials.changePassword');
  }),

  _changePasswordButtonType: computed('_changingPassword', function () {
    return this.get('_changingPassword') ? 'default' : 'primary';
  }),

  _changePasswordButtonClass: computed('_changingPassword', function () {
    return this.get('_changingPassword') ?
      'btn-change-password-cancel' : 'btn-change-password-start';
  }),

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
      userProxy,
      onepanelServer,
    } = this.getProperties(
      'userProxy',
      'onepanelServer',
    );

    // FIXME: use PUT password
    return onepanelServer.request(
      'onepanel',
      'modifyUser',
      get(userProxy, 'id'),
      UserModifyRequest.constructFromObject({
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
     * Make an API call to change password of current user
     * and handles promise resolve, reject
     * 
     * @param {object} { oldPassword: string, newPassword: string }
     * @returns {Promise} an API call promise, resolves on change password success
     */
    submitChangePassword({ currentPassword, newPassword }) {
      let {
        i18n,
        globalNotify,
      } = this.getProperties(
        'i18n',
        'globalNotify'
      );

      let changingPassword = this._changePassword({ currentPassword, newPassword });

      changingPassword.catch(error => {
        globalNotify.backendError(
          i18n.t('components.contentClustersCredentials.passwordChangedSuccess'),
          error
        );
      });

      changingPassword.then(() => {
        globalNotify.info(
          i18n.t('components.contentClustersCredentials.passwordChangedSuccess')
        );
        safeExec(this, 'set', '_changingPassword', false);
      });

      return changingPassword;
    },
  },
});
