/**
 * Adds checking if there is admin user and onezone is available before showing
 * login/register screen.
 *
 * @author Jakub Liput, Michał Borzęcki
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

    // Only in emergency Onepanel we can fetch Onepanel config without being
    // sure that we are authorized. Also it is essential for emergency Onepanel,
    // because it needs Onezone domain (got from config) to know where to
    // redirect on login page.
    // Hosted Onepanel has information about Onezone domain from URL.
    if (get(onepanelServer, 'isEmergency')) {
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

    const clusterId = get(onepanelServer, 'guiContext.clusterId');
    const isEmergency = get(onepanelServer, 'isEmergency');
    if (isEmergency) {
      const baseModel = this._super(...arguments) || {};
      return Promise.all([
        userManager.checkEmergencyPassphraseIsSet(),
        onezoneGui.getCanEnterViaOnezoneProxy(),
      ]).then(([isEmergencyPassphraseSet, canEnterViaOnezone]) => {
        setProperties(baseModel, {
          isEmergencyPassphraseSet,
          canEnterViaOnezone,
        });
        return baseModel;
      });
    } else {
      return new Promise(() => {
        sessionStorage.setItem('authRedirect', '1');
        window.location =
          onezoneGui.getOnepanelNavUrlInOnezone({
            internalRoute: `/clusters/${clusterId}`,
            redirectType: 'redirect',
          });
      });
    }
  },
});
