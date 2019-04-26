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
import notImplementedWarn from 'onedata-gui-common/utils/not-implemented-warn';

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
  registerStarted: notImplementedWarn,

  /**
   * @virtual 
   * @type {Function}
   */
  registerFailure: notImplementedWarn,

  /**
   * @virtual 
   * @type {Function}
   */
  registerSuccess: notImplementedWarn,

  /**
   * @virtual 
   * @type {Function}
   */
  back: notImplementedWarn,

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

  passwordsMatch: computed('password', 'confirmPassword', function passwordsMatch() {
    return this.get('password') === this.get('confirmPassword');
  }),

  confirmInvalid: computed(
    'confirmEntered',
    'passwordsMatch',
    function confirmInvalid() {
      return this.get('confirmEntered') && !this.get('passwordsMatch');
    }
  ),

  confirmValid: computed('confirmTyped', 'passwordsMatch', function confirmValid() {
    return this.get('confirmTyped') && this.get('passwordsMatch');
  }),

  passwordInvalidMessage: computed('password', function passwordInvalidMessage() {
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
    'password',
    'passwordInvalidMessage',
    function submitEnabled() {
      const {
        confirmValid,
        password,
        passwordInvalidMessage,
      } = this.getProperties(
        'confirmValid',
        'password',
        'passwordInvalidMessage',
      );

      return password &&
        !passwordInvalidMessage &&
        confirmValid;
    }),

  didInsertElement() {
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
    submitAddUser(password, confirmPassword) {
      if (this.get('submitEnabled')) {
        this.set('isDisabled', true);
        let promise;
        if (password && password === confirmPassword) {
          this.get('registerStarted')();
          promise = this.get('userManager').setRootPassword(password)
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
              'authenticator:application', {
                password,
              }).catch(() => {
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
