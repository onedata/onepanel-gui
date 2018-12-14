/**
 * A content page for single cluster 
 *
 * @module component/content-clusters
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { Promise } from 'rsvp';
import { scheduleOnce } from '@ember/runloop';
import { get } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';

export default Component.extend(
  createDataProxyMixin('configuration'), {
    clusterModelManager: service(),
    configurationManager: service(),

    initProcess: false,

    // FIXME: use configuration/old cluster manager
    cluster: null,

    configuration: null,

    currentClusterProxy: reads('clusterModelManager.currentClusterProxy'),

    init() {
      this._super(...arguments);
      this.get('clusterModelManager').updateCurrentClusterProxy();
      this.updateConfigurationProxy();
      const clusterId = this.get('cluster.id');
      this.get('configurationProxy').then(configuration => {
        this.get('currentClusterProxy').then(currentCluster => {
          if (get(currentCluster, 'id') === clusterId) {
            if (!get(configuration, 'isInitialized')) {
              // FIXME: safe exec
              this.set('initProcess', true);
            } else {
              scheduleOnce('afterRender', () => this.get('goToDefaultAspect')());
            }
          } else {
            // FIXME: standalone panel support - get zone domain
            const onepanelAbbrev =
              ((this.get('cluster.type') === 'oneprovider') ? 'opp' : 'ozp');
            window.location =
              `/${onepanelAbbrev}/${clusterId}/i#/onedata/clusters/${clusterId}`;
          }
        });
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
