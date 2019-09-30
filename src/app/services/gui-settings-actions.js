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
   * Returns promise, which resolves to sign-in notification message
   * @returns {Promise<GuiMessage>}
   */
  getSignInNotification() {
    return this.get('guiSettingsManager').getSignInNotification();
  },

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
   * Returns promise, which resolves to privacy policy.
   * @returns {Promise<GuiMessage>}
   */
  getPrivacyPolicy() {
    return this.get('guiSettingsManager').getPrivacyPolicy();
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
      .savePrivacyPolicy(message)
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
   * Returns promise, which resolves to cookie consent notification
   * @returns {Promise<GuiMessage>}
   */
  getCookieConsentNotification() {
    return this.get('guiSettingsManager').getCookieConsentNotification();
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
