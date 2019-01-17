/**
 * Adds checking if there is admin user and onezone is available before showing
 * login/register screen.
 *
 * @module routes/login
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import LoginRoute from 'onedata-gui-common/routes/login';
import { setProperties } from '@ember/object';
import { inject as service } from '@ember/service';
import { Promise } from 'rsvp';

export default LoginRoute.extend({
  userManager: service(),
  onezoneGui: service(),
  onepanelServer: service(),

  model() {
    const {
      onezoneGui,
      userManager,
      onepanelServer,
    } = this.getProperties('onezoneGui', 'userManager', 'onepanelServer');

    const isNotStandalone = !!onepanelServer.getClusterIdFromUrl();
    if (isNotStandalone) {
      return new Promise(() => {
        window.location =
          onezoneGui.getOnepanelNavUrlInOnezone({ useRedirect: true });
      });
    } else {
      const baseModel = this._super(...arguments) || {};

      return Promise.all([
        userManager.checkAdminUserExists(),
        onezoneGui.getIsOnezoneAvailableProxy(),
      ]).then(([adminUserExists, isOnezoneAvailable]) => {
        setProperties(baseModel, {
          adminUserExists,
          isOnezoneAvailable,
        });
        return baseModel;
      });
    }
  },
});
