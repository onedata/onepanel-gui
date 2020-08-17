/**
 * Opening this sidebar will cause to redirect into Onezone groups view
 * 
 * @module components/sidebar-groups
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import contentClustersOnepanelRedirect from 'onepanel-gui/components/content-clusters-onepanel-redirect';

export default contentClustersOnepanelRedirect.extend({
  path: 'onedata/groups',
});
