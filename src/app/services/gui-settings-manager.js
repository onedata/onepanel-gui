import Service, { inject as service } from '@ember/service';
import DOMPurify from 'npm:dompurify';
import { resolve } from 'rsvp';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import { and, or, not } from 'ember-awesome-macros';

/**
 * @typedef {Object} GuiMessage
 * @property {boolean} enabled
 * @property {string} content content with/without html tags (specific for each
 * message).
 */

export default Service.extend(
  createDataProxyMixin('signInNotification'),
  createDataProxyMixin('privacyPolicy'),
  createDataProxyMixin('cookieConsentNotification'),
  createDataProxyMixin('guiSettings'), {
    
  onepanelServer: service(),
  guiUtils: service(),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  guiSettingsValid: and(
    or(not('signInNotification.enabled'), 'signInNotification.content'),
    or(not('privacyPolicy.enabled'), 'privacyPolicy.content'),
    or(not('cookieConsentNotification.enabled'), 'cookieConsentNotification.content'),
  ),

  /**
   * @override
   */
  fetchGuiSettings() {
    const {
      signInNotificationProxy,
      privacyPolicyProxy,
      cookieConsentNotificationProxy,
    } = this.getProperties(
      'cookieConsentNotificationProxy',
      'privacyPolicyProxy',
      'cookieConsentNotificationProxy'
    );

    return Promise.all([
      signInNotificationProxy,
      privacyPolicyProxy,
      cookieConsentNotificationProxy,
    ]);
  },

  /**
   * @override
   */
  fetchSignInNotification() {
    return this.get('guiUtils.serviceType') === 'onezone' ? this.get('onepanelServer')
      .staticRequest('onezone', 'getGuiMessage', 'signin_notification')
      .then(({ data: { enabled, content } }) => ({
        enabled,
        content: DOMPurify.sanitize(content, { ALLOWED_TAGS: ['#text'] }),
      })) : resolve();
  },

  /**
   * Saves new sign-in notification config.
   * @param {GuiMessage} message
   * @returns {Promise}
   */
  setSignInNotification({ enabled, content }) {
    return this.get('onepanelServer')
      .request('onezone', 'modifyGuiMessage', 'signin_notification', {
        enabled,
        content: DOMPurify.sanitize(content, { ALLOWED_TAGS: ['#text'] }),
      });
  },

  /**
   * @override
   */
  fetchPrivacyPolicy() {
    return this.get('guiUtils.serviceType') === 'onezone' ? this.get('onepanelServer')
      .staticRequest('onezone', 'getGuiMessage', 'privacy_policy')
      .then(({ data: { enabled, content } }) => ({
        enabled,
        content: DOMPurify.sanitize(content),
      })) : resolve();
  },

  /**
   * Saves new privacy policy message config.
   * @param {GuiMessage} message
   * @returns {Promise}
   */
  setPrivacyPolicy({ enabled, content }) {
    return this.get('onepanelServer')
      .request('onezone', 'setGuiMessage', 'privacy_policy', {
        enabled,
        content: DOMPurify.sanitize(content),
      });
  },

  /**
   * @override
   */
  fetchCookieConsentNotification() {
    return this.get('guiUtils.serviceType') === 'onezone' ? this.get('onepanelServer')
      .staticRequest('onezone', 'getGuiMessage', 'cookie_consent_notification')
      .then(({ data: { enabled, content } }) => ({
        enabled,
        content: DOMPurify.sanitize(content, { ALLOWED_TAGS: ['#text'] }),
      })) : resolve();
  },

  /**
   * Saves new cookie consent notification config.
   * @param {GuiMessage} message
   * @returns {Promise}
   */
  setCookieConsentNotification({ enabled, content }) {
    return this.get('onepanelServer')
      .request('onezone', 'setGuiMessage', 'cookie_consent_notification', {
        enabled,
        content: DOMPurify.sanitize(content, { ALLOWED_TAGS: ['#text'] }),
      });
  },
});
