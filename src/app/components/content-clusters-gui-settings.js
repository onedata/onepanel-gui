import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { next } from '@ember/runloop';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

const allowedTabs = ['signInNotification', 'privacyPolicy', 'cookieConsentNotification'];

export default Component.extend(I18n, {
  classNames: ['content-clusters-gui-settings'],

  i18n: service(),
  router: service(),

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
    const {
      elementId,
      activeTab,
    } = this.getProperties('elementId', 'activeTab');
    return `${elementId}-${activeTab}`;
  }),

  init() {
    this._super(...arguments);

    if (!allowedTabs.includes(this.get('activeTab'))) {
      next(() => safeExec(this, () => this.changeTab(allowedTabs[0])));
    }
  },

  /**
   * @param {string} tabName
   * @returns {undefined}
   */
  changeTab(tabName) {
    if (allowedTabs.includes(tabName)) {
      this.get('router').transitionTo({
        queryParams: {
          options: `tab.${tabName}`,
        },
      });
    }
  },

  actions: {
    tabChange(tabId) {
      const tab = tabId.split('-')[1];
      this.changeTab(tab);
    },
  },
});
