import Service, { inject as service } from '@ember/service';
import DOMPurify from 'npm:dompurify';
import { resolve } from 'rsvp';
/**
 * Provides GUI settings management functions.
 * 
 * @module services/gui-settings-manager
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @typedef {Object} GuiMessage
 * @property {boolean} enabled
 * @property {string} body content with/without html tags (specific for each
 * message).
 */

import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import { and, not } from 'ember-awesome-macros';
import { setProperties } from '@ember/object';

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
  signInNotificationEmptyError: and(
    'signInNotification.enabled',
    not('signInNotification.body')
  ),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  privacyPolicyEmptyError: and(
    'privacyPolicy.enabled',
    not('privacyPolicy.body')
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
    not('cookieConsentNotificationEmptyError'),
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
    if (this.get('guiUtils.serviceType') === 'onezone') {
      return this.get('onepanelServer')
        .request('onezone', 'getGuiMessage', 'signin_notification')
        .then(({ data: { enabled, body } }) => ({
          enabled,
          body: DOMPurify.sanitize(body, { ALLOWED_TAGS: ['#text'] }),
        }));
    } else {
      return resolve();
    }
  },

  /**
   * Saves new sign-in notification config.
   * @param {GuiMessage} message
   * @returns {Promise}
   */
  setSignInNotification({ enabled, body }) {
    const message = {
      enabled,
      body: DOMPurify.sanitize(body, { ALLOWED_TAGS: ['#text'] }),
    };
    return this.get('onepanelServer')
      .request('onezone', 'modifyGuiMessage', 'signin_notification', message)
      .then(result => {
        setProperties(this.get('signInNotificationProxy.content'), message);
        return result;
      });
  },

  /**
   * @override
   */
  fetchPrivacyPolicy() {
    if (this.get('guiUtils.serviceType') === 'onezone') {
      return this.get('onepanelServer')
        .request('onezone', 'getGuiMessage', 'privacy_policy')
        .then(({ data: { enabled, body } }) => ({
          enabled,
          body: DOMPurify.sanitize(body),
        }));
    } else {
      return resolve();
    }
  },

  /**
   * Saves new privacy policy message config.
   * @param {GuiMessage} message
   * @returns {Promise}
   */
  setPrivacyPolicy({ enabled, body }) {
    const message = {
      enabled,
      body: DOMPurify.sanitize(body),
    };
    return this.get('onepanelServer')
      .request('onezone', 'modifyGuiMessage', 'privacy_policy', message)
      .then(result => {
        setProperties(this.get('privacyPolicyProxy.content'), message);
        return result;
      });
  },

  /**
   * @override
   */
  fetchCookieConsentNotification() {
    if (this.get('guiUtils.serviceType') === 'onezone') {
      return this.get('onepanelServer')
        .request('onezone', 'getGuiMessage', 'cookie_consent_notification')
        .then(({ data: { enabled, body } }) => ({
          enabled,
          body: DOMPurify.sanitize(body, { ALLOWED_TAGS: ['#text'] }),
        }));
    } else {
      return resolve();
    }
  },

  /**
   * Saves new cookie consent notification config.
   * @param {GuiMessage} message
   * @returns {Promise}
   */
  setCookieConsentNotification({ enabled, body }) {
    const message = {
      enabled,
      body: DOMPurify.sanitize(body, { ALLOWED_TAGS: ['#text'] }),
    };
    return this.get('onepanelServer')
      .request('onezone', 'modifyGuiMessage', 'cookie_consent_notification', message)
      .then(result => {
        setProperties(this.get('cookieConsentNotificationProxy.content'), message);
        return result;
      });
  },
});
