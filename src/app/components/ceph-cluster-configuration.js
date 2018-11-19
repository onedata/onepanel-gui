import Component from '@ember/component';
import { computed } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';

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
});
