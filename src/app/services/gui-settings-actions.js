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
   * Returns promise, which resolves to sign-in notification text.
   * @returns {Promise<string>}
   */
  getSignInNotification() {
    return this.get('guiSettingsManager').getSignInNotification();
  },

  /**
   * Saves new sign-in notification text.
   * @param {string} signInNotification
   * @returns {Promise}
   */
  saveSignInNotification(signInNotification) {
    const {
      guiSettingsManager,
      globalNotify,
    } = this.getProperties('guiSettingsManager', 'globalNotify');
    return guiSettingsManager
      .saveSignInNotification(signInNotification)
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
   * @returns {Promise<string>}
   */
  getPrivacyPolicy() {
    return this.get('guiSettingsManager').getPrivacyPolicy();
  },

  /**
   * Saves new privacy policy content.
   * @param {string} privacyPolicy
   * @returns {Promise}
   */
  savePrivacyPolicy(privacyPolicy) {
    const {
      guiSettingsManager,
      globalNotify,
    } = this.getProperties('guiSettingsManager', 'globalNotify');
    return guiSettingsManager
      .savePrivacyPolicy(privacyPolicy)
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
});
