/**
 * View Model to use in components displaying login screen elements, specifically
 * in Onepanel (via emergency port).
 *
 * @author Jakub Liput
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import LoginViewModel from 'onedata-gui-common/utils/login-view-model';
import globals from 'onedata-gui-common/utils/globals';
import { sessionExpiredKey } from 'onedata-gui-common/components/login-box';

export default LoginViewModel.extend({
  init() {
    this._super(...arguments);
    this.set('sessionHasExpired', this.consumeSessionExpiredFlag());
  },

  consumeSessionExpiredFlag() {
    if (globals.sessionStorage.getItem(sessionExpiredKey)) {
      globals.sessionStorage.removeItem(sessionExpiredKey);
      return true;
    } else {
      return false;
    }
  },
});
