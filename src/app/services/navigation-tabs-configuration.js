/**
 * Configuration and specific logic for rendering and navigating between tabs (main menu
 * and sidebar) in Onedata.
 * Implementation for Onepanel GUI.
 *
 * @author Jakub Liput
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import CommonNavigationTabsConfiguration from 'onedata-gui-common/services/navigation-tabs-configuration';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import _ from 'lodash';

class OnepanelNavigationTabsConfiguration extends CommonNavigationTabsConfiguration {
  @service onepanelServer;

  /**
   * @override
   */
  @computed
  get userId() {
    return this.onepanelServer.userId;
  }

  /**
   * @override
   * @returns {Array<OnedataTabModel>}
   */
  @computed
  get tabModels() {
    const tabModels = _.cloneDeep(super.tabModels);
    const clustersTab = tabModels.find(tab => tab.id === 'clusters');
    Object.assign(clustersTab, {
      isDefault: true,
      defaultAspect: 'overview',
    });
    return tabModels;
  }
}

export default OnepanelNavigationTabsConfiguration;
