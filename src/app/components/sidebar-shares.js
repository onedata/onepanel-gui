/**
 * Opening this sidebar will cause to redirect into Onezone shares view
 * 
 * @module components/sidebar-shares
 * @author Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import contentClustersOnezoneRedirect from 'onepanel-gui/components/content-clusters-onezone-redirect';

export default contentClustersOnezoneRedirect.extend({
  path: 'onedata/shares',
});
