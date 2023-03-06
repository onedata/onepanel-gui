/**
 * Extend navigation-state to support Onepanel special names
 *
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import NavigationState from 'onedata-gui-common/services/navigation-state';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import { camelize } from '@ember/string';

export default NavigationState.extend({
  onepanelServer: service(),
  i18n: service(),

  isEmergencyOnepanel: reads('onepanelServer.isEmergency'),

  /**
   * @override
   * Global bar title for sidebar, with support for emergency Onepanel
   * @type {Ember.ComputedProperty<string>}
   */
  globalBarSidebarTitle: computed(
    'activeResourceType',
    'isEmergencyOnepanel',
    function globalBarSidebarTitle() {
      const {
        i18n,
        isEmergencyOnepanel,
        activeResourceType,
      } = this.getProperties('i18n', 'isEmergencyOnepanel', 'activeResourceType');
      let tid = 'menuItem';
      if (activeResourceType === 'clusters' && isEmergencyOnepanel) {
        tid += 'Emergency';
      }
      return activeResourceType ?
        i18n.t(`tabs.${camelize(activeResourceType)}.${tid}`) : '';
    }
  ),
});
