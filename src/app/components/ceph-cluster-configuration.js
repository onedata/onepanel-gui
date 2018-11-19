import Component from '@ember/component';
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
});
