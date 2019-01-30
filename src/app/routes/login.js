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
import { Promise, resolve } from 'rsvp';
import { get } from '@ember/object';

export default LoginRoute.extend({
  userManager: service(),
  onezoneGui: service(),
  onepanelServer: service(),
  onepanelConfiguration: service(),

  beforeModel() {
    const result = this._super(...arguments);

    const {
      onepanelServer,
      onepanelConfiguration,
    } = this.getProperties('onepanelServer', 'onepanelConfiguration');

    // Only in standalone Onepanel we can fetch Onepanel config without being
    // sure that we are authorized. Also it is essential for standalone Onepanel,
    // because it needs Onezone domain (got from config) to know where to
    // redirect on login page.
    // Hosted Onepanel has information about Onezone domain from URL.
    if (get(onepanelServer, 'isStandalone')) {
      return resolve(result)
        .then(() => onepanelConfiguration.updateConfigurationProxy());
    } else {
      return result;
    }
  },

  model() {
    const {
      onezoneGui,
      userManager,
      onepanelServer,
    } = this.getProperties('onezoneGui', 'userManager', 'onepanelServer');

    const clusterIdFromUrl = onepanelServer.getClusterIdFromUrl();
    const isHosted = !!clusterIdFromUrl;
    if (isHosted) {
      // FIXME: test it
      return new Promise(() => {
        window.location =
          onezoneGui.getOnepanelNavUrlInOnezone({
            internalRoute: `/clusters/${clusterIdFromUrl}`,
            useRedirect: true,
          });
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
