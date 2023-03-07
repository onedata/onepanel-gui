/**
 * Override names for emergency Onepanel
 *
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OneSidebar from 'onedata-gui-common/components/one-sidebar';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';

export default OneSidebar.extend({
  onepanelServer: service(),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  title: computed(
    'resourcesModel.resourceType',
    'onepanelServer.isEmergency',
    function title() {
      const resourcesType = this.get('resourcesModel.resourceType');
      if (resourcesType) {
        let tid = 'menuItem';
        if (resourcesType === 'clusters' && this.get('onepanelServer.isEmergency')) {
          tid += 'Emergency';
        }
        return this.get('i18n').t(`tabs.${resourcesType}.${tid}`);
      } else {
        return '';
      }
    }
  ),
});
