/**
 * A content page for cluster deployment 
 *
 * @module component/content-clusters-new
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
  createDataProxyMixin('configuration'), {
    configurationManager: service(),

    initProcess: false,

    init() {
      this._super(...arguments);
      this.getConfigurationProxy().then(configuration => {
        if (!get(configuration, 'isInitialized')) {
          safeExec(this, 'setProperties', {
            initProcess: true,
          });
        } else {
          scheduleOnce('afterRender', () => this.get('goToDefaultAspect')());
        }
      });
    },

    fetchConfiguration() {
      return this.get('configurationManager').getDefaultRecord();
    },

    actions: {
      finishInitProcess() {
        return new Promise(resolve => {
          this.set('initProcess', false);
          scheduleOnce('afterRender', () => this.get('goToDefaultAspect')());
          resolve();
        });
      },
    },
  });
