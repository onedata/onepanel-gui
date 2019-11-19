/**
 * Opening this sidebar will cause to redirect into Onezone harvesters view
 * 
 * @module components/sidebar-tokens
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import contentClustersOnezoneRedirect from 'onepanel-gui/components/content-clusters-onezone-redirect';

export default contentClustersOnezoneRedirect.extend({
  path: 'onedata/harvesters',
});