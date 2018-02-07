/**
 * A blocking modal that show information about redirecting to other domain 
 *
 * @module components/modal-redirect
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  i18nPrefix: 'components.modalRedirect',

  /**
   * Set to true to open the modal
   */
  open: false,
});
