/**
 * A content page for single cluster
 *
 * @author Jakub Liput
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { Promise } from 'rsvp';
import { scheduleOnce } from '@ember/runloop';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';

export default Component.extend(
  createDataProxyMixin('installationDetails'), {
    deploymentManager: service(),
    router: service(),

    initProcess: false,

    init() {
      this._super(...arguments);
      this.updateInstallationDetailsProxy();
      this.get('installationDetailsProxy').then(installationDetails => {
        if (get(installationDetails, 'isInitialized')) {
          this.goToDefaultAspect();
        } else {
          this.goToInstallation();
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

    goToInstallation() {
      return scheduleOnce(
        'afterRender',
        () => this.get('router').transitionTo(
          'onedata.sidebar.content',
          'installation'
        )
      );
    },

    fetchInstallationDetails() {
      return this.get('deploymentManager').getInstallationDetailsProxy();
    },

    actions: {
      finishInitProcess() {
        return new Promise(resolve => {
          this.set('initProcess', false);
          scheduleOnce('afterRender', () => this.goToDefaultAspect());
          resolve();
        });
      },
    },
  });
