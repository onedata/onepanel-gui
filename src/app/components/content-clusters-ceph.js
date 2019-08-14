import Component from '@ember/component';
import { computed } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';

export default Component.extend(
  createDataProxyMixin('isDeployed'),
  createDataProxyMixin('configuration'),
  I18n, {
    classNames: ['content-clusters-ceph'],

    i18n: service(),
    cephManager: service(),

    /**
     * @override
     */
    i18nPrefix: 'components.contentClustersCeph',

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

    /**
     * @override
     */
    fetchIsDeployed() {
      return this.get('cephManager').isDeployed();
    },

    /**
     * @override
     */
    fetchConfiguration() {
      return this.get('cephManager').getConfiguration();
    },

    actions: {
      tabChange(tabId) {
        const tab = tabId.split('-')[1];
        this.set('activeTab', tab);
      },
    },
  }
);
