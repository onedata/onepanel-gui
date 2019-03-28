/**
 * A content page for cluster deployment 
 *
 * @module component/content-clusters-installation
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { Promise } from 'rsvp';
import { scheduleOnce } from '@ember/runloop';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

export default Component.extend(
  createDataProxyMixin('installationDetails'), {
    deploymentManager: service(),
    onepanelConfiguration: service(),
    router: service(),
    onezoneGui: service(),
    onepanelServer: service(),

    initProcess: false,

    init() {
      this._super(...arguments);
      this.getInstallationDetailsProxy().then(installationDetails => {
        if (!get(installationDetails, 'isInitialized')) {
          safeExec(this, 'set', 'initProcess', true);
        } else {
          scheduleOnce('afterRender', () => this.goToDefaultAspect());
        }
      });
    },

    goToDefaultAspect() {
      return scheduleOnce(
        'afterRender',
        () => this.get('router').transitionTo(
          'onedata.sidebar.content.aspect',
          'overview'
        )
      );
    },

    fetchInstallationDetails() {
      return this.get('deploymentManager').getInstallationDetailsProxy();
    },

    actions: {
      finishInitProcess() {
        return new Promise(() => {
          const clusterId = this.get('onepanelConfiguration.clusterId');
          safeExec(this, 'set', 'initProcess', false);
          if (this.get('onepanelServer.isEmergency')) {
            window.location = this.get('onezoneGui').getOnepanelNavUrlInOnezone({
              clusterId,
              internalRoute: `/clusters/${clusterId}`,
            });
          } else {
            window.location.reload();
          }
        });
      },
    },
  });
