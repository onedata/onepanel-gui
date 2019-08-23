import Service, { inject as service } from '@ember/service';
import DOMPurify from 'npm:dompurify';

export default Service.extend({
  onepanelServer: service(),

  /**
   * Returns promise, which resolves to sign-in notification text.
   * @returns {Promise<string>}
   */
  getSignInNotification() {
    return this.get('onepanelServer')
      .staticRequest('onezone', 'getSignInNotification')
      .then(({ data: { text } }) => text);
  },

  /**
   * Saves new sign-in notification text.
   * @param {string} signInNotification
   * @returns {Promise}
   */
  saveSignInNotification(signInNotification) {
    return this.get('onepanelServer')
      .request('onezone', 'setSignInNotification', { text: signInNotification });
  },

  /**
   * Returns promise, which resolves to privacy policy content.
   * @returns {Promise<string>}
   */
  getPrivacyPolicy() {
    return this.get('onepanelServer')
      .staticRequest('onezone', 'getPrivacyPolicy')
      .then(({ data: { content } }) => DOMPurify.sanitize(content));
  },

  /**
   * Saves new privacy policy content.
   * @param {string} privacyPolicy
   * @returns {Promise}
   */
  savePrivacyPolicy(privacyPolicy) {
    const content = DOMPurify.sanitize(privacyPolicy);
    return this.get('onepanelServer')
      .request('onezone', 'setPrivacyPolicy', { content });
  },
});
