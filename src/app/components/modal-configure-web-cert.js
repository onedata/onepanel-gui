/**
 * Modal that show information about changed domain 
 *
 * @module components/modal-configure-web-cert
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  classNames: ['modal-configure-web-cert'],

  i18nPrefix: 'components.modalConfigureWebCert',

  actions: {
    goToWebCert() {

    },
  },
});
