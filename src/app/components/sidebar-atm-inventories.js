/**
 * Opening this sidebar will cause to redirect into Onezone automation inventories view
 * 
 * @module components/sidebar-atm-inventories
 * @author Agnieszka Warchoł
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import contentClustersOnezoneRedirect from 'onepanel-gui/components/content-clusters-onezone-redirect';

export default contentClustersOnezoneRedirect.extend({
  path: 'onedata/atm-inventories',
});
