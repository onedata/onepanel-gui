/**
 * A content page for single cluster 
 *
 * @module component/content-clusters
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
  createDataProxyMixin('configuration'), {
    configurationManager: service(),
    router: service(),

    initProcess: false,

    configuration: null,

    init() {
      this._super(...arguments);
      this.updateConfigurationProxy();
      this.get('configurationProxy').then(configuration => {
        if (get(configuration, 'isInitialized')) {
          this.goToDefaultAspect();
        } else {
          this.goToNewAspect();
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

    goToNewAspect() {
      return scheduleOnce(
        'afterRender',
        () => this.get('router').transitionTo(
          'onedata.sidebar.content.aspect',
          'new'
        )
      );
    },

    fetchConfiguration() {
      return this.get('configurationManager').getDefaultRecord();
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
