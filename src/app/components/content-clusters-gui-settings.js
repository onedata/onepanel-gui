/**
 * A component that allows to configure Onezone GUI. Especially GUI messages like
 * sign-in notification, privacy policy content and cookie consent notification.
 * 
 * @module components/content-clusters-gui-settings
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import { computed, observer } from '@ember/object';
import { next } from '@ember/runloop';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

const allowedTabs = ['signInNotification', 'privacyPolicy', 'cookieConsentNotification'];

export default Component.extend(I18n, {
  classNames: ['content-clusters-gui-settings'],

  i18n: service(),
  router: service(),
  guiSettingsManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentClustersGuiSettings',

  /**
   * @type {string}
   */
  activeTab: 'status',

  /**
   * Tab id is in format `elementId-tab`, where tab value corresponds to
   * activeTab property possible values.
   * @type {Ember.ComputedProperty<string>}
   */
  activeTabId: computed('elementId', 'activeTab', function activeTabId() {
    return this.get(this.get('activeTab') + 'TabId');
  }),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  signInNotificationTabId: computed('elementId', function signInNotificationTabId() {
    return this.get('elementId') + '-signInNotification';
  }),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  privacyPolicyTabId: computed('elementId', function privacyPolicyTabId() {
    return this.get('elementId') + '-privacyPolicy';
  }),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  cookieConsentNotificationTabId: computed('elementId', function cookieConsentNotificationTabId() {
    return this.get('elementId') + '-cookieConsentNotification';
  }),

  activeTabObserver: observer('activeTab', function () {
    this.redirectIfTabIsNotCorrect();
  }),

  init() {
    this._super(...arguments);

    this.activeTabObserver();
  },

  redirectIfTabIsNotCorrect() {
    if (!allowedTabs.includes(this.get('activeTab'))) {
      next(() => safeExec(this, () => this.changeTab(allowedTabs[0], true)));
    }
  },

  /**
   * @param {string} tabName
   * @param {boolean} replaceHistoryEntry
   * @returns {undefined}
   */
  changeTab(tabName, replaceHistoryEntry = false) {
    if (allowedTabs.includes(tabName)) {
      const router = this.get('router');
      const transitionParams = {
        queryParams: {
          options: `tab.${tabName}`,
        },
      };

      if (replaceHistoryEntry) {
        router.replaceWith(transitionParams);
      } else {
        router.transitionTo(transitionParams);
      }
    }
  },

  actions: {
    tabChange(tabId) {
      const tab = tabId.split('-')[1];
      this.changeTab(tab);
    },
  },
});
