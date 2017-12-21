/**
 * Adds onepanel-gui-specific handlers for onedata.sidebar.content.aspect route
 *
 * @module routes/onedata/sidebar/content/aspect
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import AspectRoute from 'onedata-gui-common/routes/onedata/sidebar/content/aspect';
import { get } from '@ember/object';
import { inject } from '@ember/service';
import { reads } from '@ember/object/computed';

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
    const resourceType = get(transition.params['onedata.sidebar'], 'type');
    if (resourceType === 'clusters') {
      const aspectId = get(
        transition.params['onedata.sidebar.content.aspect'],
        'aspectId'
      );
      if (aspectId !== 'index') {
        const onepanelServiceType = this.get('onepanelServiceType');
        const cluster = get(this.modelFor('onedata.sidebar.content'), 'resource');
        if (
          get(cluster, 'isInitialized') === false ||
          (onepanelServiceType === 'zone' && aspectId !== 'nodes')
        ) {
          this.transitionTo('onedata');
        }
      }
    }
  },
});
