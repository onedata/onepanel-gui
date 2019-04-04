/**
 * A component with form for creating first admin user
 *
 * @module components/create-admin-form
 * @author Jakub Liput
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { Promise } from 'rsvp';
import { inject as service } from '@ember/service';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { computed } from '@ember/object';
import _ from 'lodash';
import notImplementedWarm from 'onedata-gui-common/utils/not-implemented-warn';

export default Component.extend(I18n, {
  classNames: ['create-admin-form', 'basicauth-login-form'],

  session: service(),
  userManager: service(),
  globalNotify: service(),
  i18n: service(),

  i18nPrefix: 'components.createAdminForm.',

  /**
   * @virtual 
   * @type {Function}
   */
  registerStarted: notImplementedWarm,

  /**
   * @virtual 
   * @type {Function}
   */
  registerFailure: notImplementedWarm,

  /**
   * @virtual 
   * @type {Function}
   */
  registerSuccess: notImplementedWarm,

  /**
   * @virtual 
   * @type {Function}
   */
  back: notImplementedWarm,

  /**
   * @type {string}
   */
  username: '',

  /**
   * @type {string}
   */
  password: '',

  /**
   * @type {string}
   */
  confirmPassword: '',

  isDisabled: false,

  error: undefined,

  passwordEntered: false,
  confirmEntered: false,
  confirmTyped: false,
  usernameEntered: false,

  passwordsMatch: computed('password', 'confirmPassword', function () {
    return this.get('password') === this.get('confirmPassword');
  }),

  usernameInvalidMessage: computed('username', function () {
    const username = this.get('username');
    if (username.length < 2) {
      return 'tooShort';
    } else {
      return null;
    }
  }),

  confirmInvalid: computed('confirmEntered', 'passwordsMatch', function () {
    return this.get('confirmEntered') && !this.get('passwordsMatch');
  }),

  confirmValid: computed('confirmTyped', 'passwordsMatch', function () {
    return this.get('confirmTyped') && this.get('passwordsMatch');
  }),

  passwordInvalidMessage: computed('password', function () {
    const password = this.get('password');
    if (password.length < 8) {
      return 'tooShort';
    } else if (_.includes(password, ':')) {
      return 'semicolon';
    } else {
      return null;
    }
  }),

  submitEnabled: computed(
    'confirmValid',
    'username',
    'password',
    'passwordInvalidMessage',
    'usernameInvalidMessage',
    function () {
      const {
        confirmValid,
        username,
        password,
        passwordInvalidMessage,
        usernameInvalidMessage,
      } = this.getProperties(
        'confirmValid',
        'username',
        'password',
        'passwordInvalidMessage',
        'usernameInvalidMessage',
      );

      return username &&
        password &&
        !passwordInvalidMessage &&
        !usernameInvalidMessage &&
        confirmValid;
    }),

  didInsertElement() {
    this.$('.add-user-username').on('focusout', () => {
      if (!this.get('usernameEntered')) {
        safeExec(this, 'set', 'usernameEntered', true);
      }
    });
    this.$('.password').on('focusout', () => {
      if (!this.get('passwordEntered')) {
        safeExec(this, 'set', 'passwordEntered', true);
      }
    });
    this.$('.confirm-password').on('focusout', () => {
      if (!this.get('confirmEntered')) {
        safeExec(this, 'set', 'confirmEntered', true);
      }
    });
    this.$('.confirm-password').on('keydown', () => {
      if (!this.get('confirmTyped')) {
        safeExec(this, 'set', 'confirmTyped', true);
      }
    });
  },

  actions: {
    submitAddUser(username, password, confirmPassword) {
      if (this.get('submitEnabled')) {
        this.set('isDisabled', true);
        let promise;
        if (username && password && password === confirmPassword) {
          this.get('registerStarted')();
          promise = this.get('userManager').addUser(
              username,
              password,
              'admin',
            )
            .catch(error => {
              this.get('globalNotify').backendError(
                this.tt('creationBackendError'),
                error
              );
              safeExec(this, 'set', 'addUserError', error || 'unknown');
              throw error;
            });
        } else {
          promise = Promise.reject();
        }
        return promise
          .then(() => safeExec(this, 'registerSuccess'))
          .then(() => {
            return this.get('session').authenticate(
              'authenticator:application',
              username,
              password
            ).catch(() => {
              // in very rare cases, new account can be broken (unavailable)
              window.location.reload();
            });
          })
          .finally(() => safeExec(this, 'set', 'isDisabled', false));
      } else {
        return Promise.reject();
      }
    },

    back() {
      this.get('back')(...arguments);
    },
  },
});
