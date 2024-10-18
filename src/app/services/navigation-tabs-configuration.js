/**
 * Configuration and specific logic for rendering and navigating between tabs (main menu
 * and sidebar) in Onedata.
 * Implementation for Onepanel GUI.
 *
 * @author Jakub Liput
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import AbstractNavigationTabsConfiguration from 'onedata-gui-common/services/navigation-tabs-configuration';

class OnepanelNavigationTabsConfiguration extends AbstractNavigationTabsConfiguration {
  /**
   * @override
   * @returns {Array<OnedataTabModel>}
   */
  getTabModels() {
    return [
      { id: 'spaces', icon: 'browser-directory' },
      { id: 'shares', icon: 'browser-share' },
      { id: 'providers', icon: 'provider' },
      { id: 'groups', icon: 'groups' },
      { id: 'tokens', icon: 'tokens' },
      { id: 'harvesters', icon: 'light-bulb' },
      { id: 'atmInventories', icon: 'atm-inventory' },
      {
        id: 'clusters',
        icon: 'cluster',
        isDefault: true,
        defaultAspect: 'overview',
      },
    ];
  }
}

export default OnepanelNavigationTabsConfiguration;
