/**
 * Implements emergency passphrase change operation
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

export default Component.extend(I18n, {
  classNames: ['content-cluster-emergency-passphrase'],

  i18n: service(),
  globalNotify: service(),
  userManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentClustersEmergencyPassphrase',

  /**
   * If true, set credentials form to changingPassphrase mode
   * @type {boolean}
   */
  isChangingPassphrase: false,

  actions: {
    toggleChangePassphrase() {
      this.toggleProperty('isChangingPassphrase');
    },

    /**
     * Make an API call to change emergency passphrase and handles promise
     * resolve, reject
     *
     * @param {object} { currentPassword: string, newPassword: string }
     * @returns {Promise} an API call promise, resolves on change passphrase success
     */
    submitChangePassphrase({ currentPassword, newPassword }) {
      const {
        globalNotify,
        userManager,
      } = this.getProperties('globalNotify', 'userManager');

      const changingPassphrase = userManager.changeEmergencyPassphrase(
        currentPassword,
        newPassword
      );

      changingPassphrase.catch(error => {
        globalNotify.backendError(this.t('passphraseChangeErrorType'), error);
      });

      changingPassphrase.then(() => {
        globalNotify.info(this.t('passphraseChangedSuccess'));
        safeExec(this, 'set', 'isChangingPassphrase', false);
      });

      return changingPassphrase;
    },
  },
});
