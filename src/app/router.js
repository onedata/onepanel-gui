/**
 * Using standard routes and configuration from onedata-gui-common addon
 *
 * @author Jakub Liput
 * @copyright (C) 2017-2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OnedataRouter from 'onedata-gui-common/utils/onedata-router';
import onedataRouterSetup from 'onedata-gui-common/utils/onedata-router-setup';
import config from './config/environment';
import isCrossOriginIframe from 'onedata-gui-common/utils/is-cross-origin-iframe';

const Router = OnedataRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL,
});

// eslint-disable-next-line array-callback-return
Router.map(function () {
  // There are no public routes (available in the iframe embedded in foreign site)
  // in Onepanel.
  if (!isCrossOriginIframe()) {
    onedataRouterSetup(Router, this);
  }
});

export default Router;
