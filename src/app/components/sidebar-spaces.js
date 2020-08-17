/**
 * Opening this sidebar will cause to redirect into Onezone spaces (data) view
 * 
 * @module components/sidebar-spaces
 * @author Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import contentClustersOnepanelRedirect from 'onepanel-gui/components/content-clusters-onepanel-redirect';

export default contentClustersOnepanelRedirect.extend({
  path: 'onedata/spaces',
});
