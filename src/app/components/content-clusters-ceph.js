import Component from '@ember/component';
import { computed } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';

export default Component.extend(I18n, {
  i18n: service(),
  cephManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentClustersCeph',
  
  /**
   * @type {PromiseObject<Utils/Ceph/ClusterConfiguration>}
   */
  configurationProxy: computed(function configurationProxy() {
    return this.get('cephManager').getConfiguration();
  }),
});
