/**
 * Adds onepanel-gui-specific handlers for onedata.sidebar.content.aspect route
 *
 * @module routes/onedata/sidebar/content/aspect
 * @author Jakub Liput
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import AspectRoute from 'onedata-gui-common/routes/onedata/sidebar/content/aspect';
import { get } from '@ember/object';
import { inject } from '@ember/service';
import { reads } from '@ember/object/computed';

const zoneAspects = new Set(['overview', 'nodes', 'dns', 'certificate', 'credentials']);

export default AspectRoute.extend({
  onepanelServer: inject(),
  onepanelServiceType: reads('onepanelServer.serviceType'),

  beforeModel(transition) {
    this._super(...arguments);
    this._redirectClusterAspect(transition);
  },

  /**
   * Do not allow to go into clusters' aspects other than index if cluster
   * is not initialized yet or allow only nodes if in Zone
   * @param {Ember.Transition} transition 
   */
  _redirectClusterAspect(transition) {
    const aspectId = get(
      transition.params['onedata.sidebar.content.aspect'],
      'aspect_id'
    );
    if (aspectId === 'not-found') {
      return;
    }
    const resourceType = get(transition.params['onedata.sidebar'], 'type');
    if (resourceType === 'clusters') {
      if (aspectId !== 'index') {
        const onepanelServiceType = this.get('onepanelServiceType');
        const cluster = get(this.modelFor('onedata.sidebar.content'), 'resource');
        if (
          get(cluster, 'isInitialized') === false ||
          (onepanelServiceType === 'zone' && !zoneAspects.has(aspectId))
        ) {
          this.transitionTo('onedata');
        }
      }
    }
  },
});
