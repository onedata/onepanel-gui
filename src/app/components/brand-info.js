/**
 * Implements brand info for Onepanel GUIs
 *
 * @module components/brand-info.js
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

// TODO i18n

import Ember from 'ember';
import BrandInfo from 'onedata-gui-common/components/brand-info';
import layout from 'onedata-gui-common/templates/components/brand-info';

const {
  inject: { service },
  computed: { readOnly },
  computed,
} = Ember;

export default BrandInfo.extend({
  layout,

  i18n: service(),
  onepanelServer: service(),
  // TODO make a promise to wait for completion
  onepanelServiceType: readOnly('onepanelServer.serviceType'),

  brandSubtitle: computed('onepanelServiceType', function () {
    let {
      i18n,
      onepanelServiceType,
    } = this.getProperties('i18n', 'onepanelServiceType');
    return onepanelServiceType ?
      i18n.t(`components.brandInfo.serviceType.${onepanelServiceType}`) : null;
  }),
});
