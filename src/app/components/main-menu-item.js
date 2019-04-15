/**
 * Override names for emergency Onepanel
 * 
 * @module components/main-menu-item
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import MainMenuItem from 'onedata-gui-common/components/main-menu-item';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';

export default MainMenuItem.extend({
  onepanelServer: service(),

  /**
   * @override
   * @type {Ember.ComputerProperty<string>}
   */
  name: computed('item.id', 'onepanelServer.isEmergency', function name() {
    const {
      item,
      i18n,
    } = this.getProperties('item', 'i18n');
    let tid = 'menuItem';
    if (item.id === 'clusters' && this.get('onepanelServer.isEmergency')) {
      tid += 'Emergency';
    }
    return i18n.t(`tabs.${item.id}.${tid}`);
  }),
});
