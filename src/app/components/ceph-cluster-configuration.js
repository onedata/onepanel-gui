import Component from '@ember/component';
import { computed } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { next } from '@ember/runloop';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

export default Component.extend(I18n, {
  classNames: ['ceph-cluster-configuration'],

  /**
   * @override
   */
  i18nPrefix: 'components.cephClusterConfiguration',

  /**
   * @type {Ember.ComputedProperty<Utils/Ceph/ClusterConfiguration>}
   */
  config: undefined,

  mode: 'standalone',

  isStandalone: computed('mode', function isStandalone() {
    return this.get('mode') !== 'create';
  }),

  init() {
    this._super(...arguments);

    this.get('config.osdIdGenerator.nextIdProxy').then(() => {
      next(() => safeExec(this, 'expandNodesInCreateMode'));
    });
  },

  /**
   * Expands all nodes if "create" mode is active
   * @returns {undefined}
   */
  expandNodesInCreateMode() {
    if (this.get('mode') === 'create') {
      this.$('.ceph-node-header').click();
    }
  },
});
