/**
 * Render additional information about app below onedata brand (logo)
 *
 * @module components/brand-info.js
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

// TODO i18n

import Ember from 'ember';

const {
  Component,
  inject: { service },
  computed: { readOnly },
  computed,
} = Ember;

export default Component.extend({
  classNames: ['brand-info'],

  i18n: service(),
  onepanelServer: service(),
  // TODO make a promise to wait for completion
  onepanelServiceType: readOnly('onepanelServer.serviceType'),

  brandSubtitle: computed('onepanelServiceType', function () {
    let {
      i18n,
      onepanelServiceType
    } = this.getProperties('i18n', 'onepanelServiceType');
    return onepanelServiceType ?
      i18n.t(`components.brandInfo.serviceType.${onepanelServiceType}`) : null;
  }),
});