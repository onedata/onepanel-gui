/**
 * Opening this sidebar will cause to redirect into Onezone providers view
 * 
 * @module components/sidebar-providers
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import contentClustersOnepanelRedirect from 'onepanel-gui/components/content-clusters-onepanel-redirect';

export default contentClustersOnepanelRedirect.extend({
  path: 'onedata/providers',
});
