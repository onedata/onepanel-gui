/**
 * A login-box header component specific for Onepanel
 *
 * @module components/login-box/header
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Header from 'onedata-gui-common/components/login-box/header';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import layout from 'onedata-gui-common/templates/components/login-box/header';

export default Header.extend({
  layout,

  onepanelServer: inject(),
  onepanelServiceType: computed.readOnly('onepanelServer.serviceType'),

  /**
   * @override
   */
  loginMainTitleClass: computed.readOnly('onepanelServiceType'),

  /**
   * @override
   */
  brandTitle: computed('onepanelServiceType', function () {
    let {
      i18n,
      onepanelServiceType,
    } = this.getProperties('i18n', 'onepanelServiceType');
    return onepanelServiceType ?
      'One' + i18n.t(`components.brandInfo.serviceType.${onepanelServiceType}`) :
      null;
  }),
});
