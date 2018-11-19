import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { observer } from '@ember/object';

export default Component.extend(I18n, {
  tagName: '',

  /**
   * @override
   */
  i18nPrefix: 'components.cephClusterConfiguration.node',

  /**
   * @virtual
   * @type {Components/OneCollapsibleList}
   */
  listComponent: undefined,

  /**
   * @virtual
   * @type {Utils/Ceph/CephNodeConfiguration}
   */
  node: undefined,

  isStandalone: true,

  /**
   * @type {boolean}
   */
  allowsEdition: false,

  isStandaloneObserver: observer('isStandalone', function isStandaloneObserver() {
    const isStandalone = this.get('isStandalone');
    if (!isStandalone) {
      this.set('allowsEdition', true);
    }
  }),

  init() {
    this._super(...arguments);
    this.isStandaloneObserver();
  },

  actions: {
    addOsd() {
      this.get('node').addOsd();
    },
    removeOsd(id) {
      this.get('node').removeOsd(id);
    },
    toggleManagerMonitor() {
      this.toggleProperty('node.managerMonitor.isEnabled');
    },
  },
});
