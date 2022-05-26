/**
 * Provides GUI settings management functions.
 *
 * @module services/gui-settings-manager
 * @author Michał Borzęcki
 * @copyright (C) 2019-2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @typedef {Object} GuiMessage
 * @property {boolean} enabled
 * @property {string} body content with/without html tags (specific for each
 * message).
 */

import Service, { inject as service } from '@ember/service';
import { resolve, all as allFulfilled } from 'rsvp';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import { and, not } from 'ember-awesome-macros';
import { setProperties, computed } from '@ember/object';
import DOMPurify from 'npm:dompurify';

const mixins = [
  createDataProxyMixin('signInNotification'),
  createDataProxyMixin('privacyPolicy'),
  createDataProxyMixin('termsOfUse'),
  createDataProxyMixin('cookieConsentNotification'),
  createDataProxyMixin('guiSettings'),
];

export default Service.extend(...mixins, {
  onepanelServer: service(),
  guiUtils: service(),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  signInNotificationEmptyError: and(
    'signInNotification.enabled',
    not('signInNotification.body')
  ),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  privacyPolicyEmptyError: computed(
    'privacyPolicy.{body,enabled}',
    function privacyPolicyEmptyError() {
      const enabled = this.get('privacyPolicy.enabled');
      const body = this.get('privacyPolicy.body');
      return enabled && this.isBodyEmpty(body);
    }
  ),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  termsOfUseEmptyError: computed(
    'termsOfUse.{body,enabled}',
    function termsOfUseEmptyError() {
      const enabled = this.get('termsOfUse.enabled');
      const body = this.get('termsOfUse.body');
      return enabled && this.isBodyEmpty(body);
    }
  ),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  cookieConsentNotificationEmptyError: and(
    'cookieConsentNotification.enabled',
    not('cookieConsentNotification.body')
  ),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  guiSettingsValid: and(
    not('signInNotificationEmptyError'),
    not('privacyPolicyEmptyError'),
    not('termsOfUseEmptyError'),
    not('cookieConsentNotificationEmptyError'),
  ),

  /**
   * @override
   */
  fetchGuiSettings() {
    const {
      signInNotificationProxy,
      privacyPolicyProxy,
      termsOfUseProxy,
      cookieConsentNotificationProxy,
    } = this.getProperties(
      'signInNotificationProxy',
      'privacyPolicyProxy',
      'termsOfUseProxy',
      'cookieConsentNotificationProxy'
    );

    return allFulfilled([
      signInNotificationProxy,
      privacyPolicyProxy,
      termsOfUseProxy,
      cookieConsentNotificationProxy,
    ]);
  },

  /**
   * @override
   */
  fetchSignInNotification() {
    if (this.get('guiUtils.serviceType') === 'onezone') {
      return this.get('onepanelServer')
        .request('ServiceConfigurationApi', 'getGuiMessage', 'signin_notification')
        .then(({ data }) => this.sanitizeGuiMessage(data, true));
    } else {
      return resolve();
    }
  },

  /**
   * Saves new sign-in notification config.
   * @param {GuiMessage} message
   * @returns {Promise}
   */
  saveSignInNotification(message) {
    const sanitizedMessage = this.sanitizeGuiMessage(message, true);
    return this.get('onepanelServer')
      .request(
        'ServiceConfigurationApi',
        'modifyGuiMessage',
        'signin_notification',
        sanitizedMessage
      )
      .then(result => {
        setProperties(this.get('signInNotificationProxy.content'), sanitizedMessage);
        return result;
      });
  },

  /**
   * @override
   */
  fetchPrivacyPolicy() {
    if (this.get('guiUtils.serviceType') === 'onezone') {
      return this.get('onepanelServer')
        .request('ServiceConfigurationApi', 'getGuiMessage', 'privacy_policy')
        .then(({ data }) => this.sanitizeGuiMessage(data));
    } else {
      return resolve();
    }
  },

  /**
   * Saves new privacy policy message config.
   * @param {GuiMessage} message
   * @returns {Promise}
   */
  savePrivacyPolicy(message) {
    const sanitizedMessage = this.sanitizeGuiMessage(message);
    return this.get('onepanelServer')
      .request(
        'ServiceConfigurationApi',
        'modifyGuiMessage',
        'privacy_policy',
        sanitizedMessage
      )
      .then(result => {
        setProperties(this.get('privacyPolicyProxy.content'), sanitizedMessage);
        return result;
      });
  },

  /**
   * @override
   */
  fetchTermsOfUse() {
    if (this.get('guiUtils.serviceType') === 'onezone') {
      return this.get('onepanelServer')
        .request('ServiceConfigurationApi', 'getGuiMessage', 'terms_of_use')
        .then(({ data }) => this.sanitizeGuiMessage(data));
    } else {
      return resolve();
    }
  },

  /**
   * Saves new terms of use message config.
   * @param {GuiMessage} message
   * @returns {Promise}
   */
  saveTermsOfUse(message) {
    const sanitizedMessage = this.sanitizeGuiMessage(message);
    return this.get('onepanelServer')
      .request(
        'ServiceConfigurationApi',
        'modifyGuiMessage',
        'terms_of_use',
        sanitizedMessage
      )
      .then(result => {
        setProperties(this.get('termsOfUseProxy.content'), sanitizedMessage);
        return result;
      });
  },

  /**
   * @override
   */
  fetchCookieConsentNotification() {
    if (this.get('guiUtils.serviceType') === 'onezone') {
      return this.get('onepanelServer')
        .request(
          'ServiceConfigurationApi',
          'getGuiMessage',
          'cookie_consent_notification'
        )
        .then(({ data }) => this.sanitizeGuiMessage(data, true));
    } else {
      return resolve();
    }
  },

  /**
   * Saves new cookie consent notification config.
   * @param {GuiMessage} message
   * @returns {Promise}
   */
  saveCookieConsentNotification(message) {
    const sanitizedMessage = this.sanitizeGuiMessage(message, true);
    return this.get('onepanelServer')
      .request(
        'ServiceConfigurationApi',
        'modifyGuiMessage',
        'cookie_consent_notification',
        sanitizedMessage
      )
      .then(result => {
        setProperties(this.get('cookieConsentNotificationProxy.content'), sanitizedMessage);
        return result;
      });
  },

  /**
   * @param {GuiMessage} message
   * @param {boolean} [textOnly=false]
   * @returns {GuiMessage}
   */
  sanitizeGuiMessage(message, textOnly = false) {
    if (!message || typeof message.body !== 'string') {
      return message;
    }
    return Object.assign({}, message, {
      body: this.sanitizeGuiMessageBody(message.body, textOnly),
    });
  },

  /**
   * @param {string} body
   * @param {boolean} [textOnly=false]
   * @returns {string}
   */
  sanitizeGuiMessageBody(body, textOnly) {
    const sanitizedBody = textOnly ?
      DOMPurify.sanitize(body, { ALLOWED_TAGS: ['#text'] }) :
      DOMPurify.sanitize(body);
    return sanitizedBody.toString();
  },

  isBodyEmpty(body) {
    const span = document.createElement('span');
    span.innerHTML = body;
    const text = span.textContent || span.innerText || '';
    return !text.trim();
  },
});
