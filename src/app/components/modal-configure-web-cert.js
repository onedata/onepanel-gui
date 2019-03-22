/**
 * Modal that shows information about changed domain 
 *
 * @module components/modal-configure-web-cert
 * @author Jakub Liput
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import notImplementedWarn from 'onedata-gui-common/utils/not-implemented-warn';

export default Component.extend(I18n, {
  classNames: ['modal-configure-web-cert'],

  i18nPrefix: 'components.modalConfigureWebCert',

  /**
   * @virtual
   * Function invoked on modal close
   * @type {function}
   */
  onHide: notImplementedWarn,

  actions: {
    onHide() {
      return this.get('onHide')();
    },
  },
});
