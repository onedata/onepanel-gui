/**
 * Provides actions specific for GUI settings.
 * 
 * @module services/gui-settings-actions
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Service.extend(I18n, {
  i18n: service(),
  guiSettingsManager: service(),
  globalNotify: service(),

  /**
   * @override
   */
  i18nPrefix: 'services.guiSettingsActions',

  /**
   * Saves new sign-in notification.
   * @param {GuiMessage} message
   * @returns {Promise}
   */
  setSignInNotification(message) {
    const {
      guiSettingsManager,
      globalNotify,
    } = this.getProperties('guiSettingsManager', 'globalNotify');
    return guiSettingsManager
      .setSignInNotification(message)
      .then(
        result => {
          globalNotify.success(this.t('signInNotificationSaveSuccess'));
          return result;
        },
        error => {
          globalNotify.backendError(this.t('savingSignInNotification', error));
          throw error;
        }
      );
  },

  /**
   * Saves new privacy policy content.
   * @param {GuiMessage} message
   * @returns {Promise}
   */
  setPrivacyPolicy(message) {
    const {
      guiSettingsManager,
      globalNotify,
    } = this.getProperties('guiSettingsManager', 'globalNotify');
    return guiSettingsManager
      .setPrivacyPolicy(message)
      .then(
        result => {
          globalNotify.success(this.t('privacyPolicySaveSuccess'));
          return result;
        },
        error => {
          globalNotify.backendError(this.t('savingPrivacyPolicy', error));
          throw error;
        }
      );
  },

  /**
   * Saves new cookie consent notification.
   * @param {GuiMessage} message
   * @returns {Promise}
   */
  setCookieConsentNotification(message) {
    const {
      guiSettingsManager,
      globalNotify,
    } = this.getProperties('guiSettingsManager', 'globalNotify');
    return guiSettingsManager
      .setCookieConsentNotification(message)
      .then(
        result => {
          globalNotify.success(this.t('cookieConsentNotificationSaveSuccess'));
          return result;
        },
        error => {
          globalNotify.backendError(this.t('savingCookieConsentNotification', error));
          throw error;
        }
      );
  },
});
