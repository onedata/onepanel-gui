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

export default AspectRoute.extend({
  beforeModel(transition) {
    this._super(...arguments);
    this._redirectIfClusterNotInitialized(transition);
  },

  /**
   * Do not allow to go into clusters' aspects other than index if cluster
   * is not initialized yet
   * @param {Ember.Transition} transition 
   */
  _redirectIfClusterNotInitialized(transition) {
    const resourceType = get(transition.params['onedata.sidebar'], 'type');
    if (resourceType === 'clusters') {
      const aspectId = get(
        transition.params['onedata.sidebar.content.aspect'],
        'aspectId'
      );
      if (aspectId !== 'index') {
        const cluster = get(this.modelFor('onedata.sidebar.content'), 'resource');
        if (get(cluster, 'isInitialized') === false) {
          this.transitionTo('onedata');
        }
      }
    }
  },
});
