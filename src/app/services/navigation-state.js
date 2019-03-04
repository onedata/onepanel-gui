/**
 * Extend navigation-state to support Onepanel special names
 * 
 * @module services/navigation-state
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import NavigationState from 'onedata-gui-common/services/navigation-state';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';

export default NavigationState.extend({
  onepanelServer: service(),
  i18n: service(),

  isStandaloneOnepanel: reads('onepanelServer.isStandalone'),

  /**
   * @override
   * Global bar title for sidebar, with support for standalone Onepanel
   * @type {Ember.ComputedProperty<string>}
   */
  globalBarSidebarTitle: computed(
    'activeResourceType',
    'isStandaloneOnepanel',
    function globalBarSidebarTitle() {
      const {
        i18n,
        isStandaloneOnepanel,
        activeResourceType,
      } = this.getProperties('i18n', 'isStandaloneOnepanel', 'activeResourceType');
      let tid = 'menuItem' + (isStandaloneOnepanel ? 'Standalone' : '');
      return i18n.t(`tabs.${activeResourceType}.${tid}`);
    }
  ),
});
