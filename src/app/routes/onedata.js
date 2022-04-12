/**
 * Adds Onepanel/Cluster specific data wait and resolve for `onedata` route
 *
 * @module routes/onedata
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { inject as service } from '@ember/service';
import { get, set, setProperties } from '@ember/object';
import OnedataRoute from 'onedata-gui-common/routes/onedata';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { all as allFulfilled } from 'rsvp';

export default OnedataRoute.extend(I18n, {
  clusterModelManager: service(),
  onepanelServer: service(),
  deploymentManager: service(),
  onepanelConfiguration: service(),
  onezoneGui: service(),

  /**
   * @override
   */
  i18nPrefix: 'routes.onedata',

  beforeModel() {
    this._super(...arguments);
    if (this.get('onepanelServer.isInitialized')) {
      return this.get('onepanelConfiguration').getConfigurationProxy()
        .then(() => this.get('clusterModelManager').getCurrentClusterProxy());
    } else {
      return this.transitionTo('login');
    }
  },

  model() {
    const isEmergency = this.get('onepanelServer.isEmergency');
    return allFulfilled([
      this._super(...arguments),
      this.get('deploymentManager').getInstallationDetailsProxy(),
    ]).then(([model, installDetails]) => {
      if (isEmergency) {
        const items = get(model, 'mainMenuItems');
        if (get(installDetails, 'isInitialized') === false) {
          set(
            model,
            'mainMenuItems',
            items.filter(item => get(item, 'id') === 'clusters')
          );
        } else {
          items.forEach(item => {
            if (get(item, 'id') !== 'clusters') {
              setProperties(item, {
                disabled: true,
                tip: this.t('useOnezoneToAccess'),
              });
            }
          });
        }
      }
      return model;
    });
  },

  setupController(controller, model) {
    this._super(...arguments);
    const {
      onepanelServer,
      deploymentManager,
    } = this.getProperties('onepanelServer', 'deploymentManager');
    const isEmergency = get(onepanelServer, 'isEmergency');
    return deploymentManager.getInstallationDetailsProxy()
      .then(installationDetails => {
        set(
          controller,
          'emergencyWarningBarVisible',
          isEmergency &&
          get(installationDetails, 'isInitialized')
        );
      })
      .then(() => model);
  },
});
