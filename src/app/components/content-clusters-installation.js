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
  createDataProxyMixin('configuration'), {
    configurationManager: service(),
    onepanelConfiguration: service(),
    router: service(),
    onezoneGui: service(),

    initProcess: false,

    init() {
      this._super(...arguments);
      this.getConfigurationProxy().then(configuration => {
        if (!get(configuration, 'isInitialized')) {
          safeExec(this, 'setProperties', {
            initProcess: true,
          });
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

    fetchConfiguration() {
      return this.get('configurationManager').getDefaultRecord();
    },

    actions: {
      finishInitProcess() {
        return new Promise(() => {
          const clusterId = this.get('onepanelConfiguration.clusterId');
          this.set('initProcess', false);
          window.location = this.get('onezoneGui').getOnepanelNavUrlInOnezone({
            // FIXME: currently clusterId is "new-cluster", so this will not work
            clusterId,
            internalRoute: `/clusters/${clusterId}`,
          });
        });
      },
    },
  });
