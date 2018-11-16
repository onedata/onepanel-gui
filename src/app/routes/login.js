/**
 * Adds checking if there is admin user before showing login/register screen
 *
 * @module routes/login
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import LoginRoute from 'onedata-gui-common/routes/login';
import { set } from '@ember/object';
import { inject as service } from '@ember/service';

export default LoginRoute.extend({
  userManager: service(),

  model() {
    const baseModel = this._super(...arguments) || {};
    return this.get('userManager').checkAdminUserExists()
      .then(isAdminPresent => {
        set(baseModel, 'adminUserExists', isAdminPresent);
        return baseModel;
      });
  },
});
