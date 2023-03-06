/**
 * A component with form for setting first emergency passphrase
 *
 * @author Jakub Liput, Michał Borzęcki
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
import $ from 'jquery';

export default Component.extend(I18n, {
  classNames: ['first-emergency-passphrase-form', 'basicauth-login-form'],

  session: service(),
  userManager: service(),
  globalNotify: service(),
  i18n: service(),

  i18nPrefix: 'components.firstEmergencyPassphraseForm.',

  /**
   * @virtual
   * @type {Function}
   */
  settingPassphraseStarted: notImplementedWarn,

  /**
   * @virtual
   * @type {Function}
   */
  settingPassphraseFailure: notImplementedWarn,

  /**
   * @virtual
   * @type {Function}
   */
  settingPassphraseSuccess: notImplementedWarn,

  /**
   * @virtual
   * @type {Function}
   */
  back: notImplementedWarn,

  /**
   * @type {string}
   */
  passphrase: '',

  /**
   * @type {string}
   */
  confirmPassphrase: '',

  isDisabled: false,

  error: undefined,

  passphraseEntered: false,
  confirmEntered: false,
  confirmTyped: false,

  passphrasesMatch: computed('passphrase', 'confirmPassphrase', function passphrasesMatch() {
    return this.get('passphrase') === this.get('confirmPassphrase');
  }),

  confirmInvalid: computed(
    'confirmEntered',
    'passphrasesMatch',
    function confirmInvalid() {
      return this.get('confirmEntered') && !this.get('passphrasesMatch');
    }
  ),

  confirmValid: computed('confirmTyped', 'passphrasesMatch', function confirmValid() {
    return this.get('confirmTyped') && this.get('passphrasesMatch');
  }),

  passphraseInvalidMessage: computed('passphrase', function passphraseInvalidMessage() {
    const passphrase = this.get('passphrase');
    if (passphrase.length < 8) {
      return 'tooShort';
    } else if (_.includes(passphrase, ':')) {
      return 'semicolon';
    } else {
      return null;
    }
  }),

  submitEnabled: computed(
    'confirmValid',
    'passphrase',
    'passphraseInvalidMessage',
    function submitEnabled() {
      const {
        confirmValid,
        passphrase,
        passphraseInvalidMessage,
      } = this.getProperties(
        'confirmValid',
        'passphrase',
        'passphraseInvalidMessage',
      );

      return passphrase &&
        !passphraseInvalidMessage &&
        confirmValid;
    }),

  didInsertElement() {
    const $element = $(this.get('element'));
    $element.find('.passphrase').on('focusout', () => {
      if (!this.get('passphraseEntered')) {
        safeExec(this, 'set', 'passphraseEntered', true);
      }
    });
    $element.find('.confirm-passphrase').on('focusout', () => {
      if (!this.get('confirmEntered')) {
        safeExec(this, 'set', 'confirmEntered', true);
      }
    });
    $element.find('.confirm-passphrase').on('keydown', () => {
      if (!this.get('confirmTyped')) {
        safeExec(this, 'set', 'confirmTyped', true);
      }
    });
  },

  actions: {
    submitPassphrase(passphrase, confirmPassphrase) {
      if (this.get('submitEnabled')) {
        this.set('isDisabled', true);
        let promise;
        if (passphrase && passphrase === confirmPassphrase) {
          this.get('settingPassphraseStarted')();
          promise = this.get('userManager').setFirstEmergencyPassphrase(passphrase)
            .catch(error => {
              this.get('globalNotify').backendError(
                this.tt('settingPassphraseBackendError'),
                error
              );
              safeExec(this, 'settingPassphraseFailure');
              throw error;
            });
        } else {
          promise = Promise.reject();
        }
        return promise
          .then(() => safeExec(this, 'settingPassphraseSuccess'))
          .then(() => {
            return this.get('session').authenticate(
              'authenticator:application', {
                password: passphrase,
              }).catch(() => {
              // in very rare cases cannot login immediately
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
