import Component from '@ember/component';
import { computed } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';

export default Component.extend(I18n, {
  classNames: ['content=clusters-ceph'],

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
   * @type {Ember.ComputedProperty<PromiseObject<boolean>>}
   */
  isDeployedProxy: computed(function isDeployedProxy() {
    return this.get('cephManager').isDeployed();
  }),
  
  /**
   * @type {Ember.ComputedProperty<PromiseObject<Utils/Ceph/ClusterConfiguration>>}
   */
  configurationProxy: computed(function configurationProxy() {
    return this.get('cephManager').getConfiguration();
  }),

  actions: {
    tabChange(tabId) {
      const tab = tabId.split('-')[1];
      this.set('activeTab', tab);
    },
  },
});
