/**
 * Implements emergency passphrase change operation
 * 
 * @module components/content-clusters-emergency-passphrase
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
  EmergencyPassphraseChangeRequest,
} = Onepanel;

export default Component.extend(I18n, {
  classNames: ['content-cluster-emergency-passphrase'],

  i18n: service(),
  globalNotify: service(),
  onepanelServer: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentClustersEmergencyPassphrase',

  /**
   * If true, set credentials form to changingPassphrase mode
   * @type {boolean}
   */
  _changingPassphrase: false,

  _changePassphraseButtonLabel: computed('_changingPassphrase', function () {
    return this.get('_changingPassphrase') ?
      this.t('cancelChangePassphrase') :
      this.t('changePassphrase');
  }),

  _changePassphraseButtonType: computed('_changingPassphrase', function () {
    return this.get('_changingPassphrase') ? 'default' : 'primary';
  }),

  _changePassphraseButtonClass: computed('_changingPassphrase', function () {
    return this.get('_changingPassphrase') ?
      'btn-change-passphrase-cancel' : 'btn-change-passphrase-start';
  }),

  /**
   * Make an API call to change emergency passphrase
   * @override
   * @param {object} data
   * @param {string} data.currentPassphrase
   * @param {string} data.newPassphrase
   * @returns {Promise} resolves on change passphrase success
   */
  _changePassphrase({ currentPassphrase, newPassphrase }) {
    const onepanelServer = this.get('onepanelServer');

    return onepanelServer.request(
      'onepanel',
      'setEmergencyPassphrase',
      EmergencyPassphraseChangeRequest.constructFromObject({
        currentPassphrase,
        newPassphrase,
      })
    );
  },

  actions: {
    toggleChangePassphrase() {
      this.toggleProperty('_changingPassphrase');
    },

    /**
     * Make an API call to change emergency passphrase and handles promise
     * resolve, reject
     * 
     * @param {object} { currentPassword: string, newPassword: string }
     * @returns {Promise} an API call promise, resolves on change passphrase success
     */
    submitChangePassphrase({ currentPassword, newPassword }) {
      const globalNotify = this.get('globalNotify');

      let changingPassphrase = this._changePassphrase({
        currentPassphrase: currentPassword,
        newPassphrase: newPassword,
      });

      changingPassphrase.catch(error => {
        globalNotify.backendError(this.t('passphraseChangeErrorType'), error);
      });

      changingPassphrase.then(() => {
        globalNotify.info(this.t('passphraseChangedSuccess'));
        safeExec(this, 'set', '_changingPassphrase', false);
      });

      return changingPassphrase;
    },
  },
});
