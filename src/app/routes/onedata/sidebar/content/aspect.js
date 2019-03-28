/**
 * Adds onepanel-gui-specific handlers for onedata.sidebar.content.aspect route
 *
 * @module routes/onedata/sidebar/content/aspect
 * @author Jakub Liput
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import AspectRoute from 'onedata-gui-common/routes/onedata/sidebar/content/aspect';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';

const zoneAspects = new Set(['overview', 'nodes', 'dns', 'certificate', 'credentials', 'members']);

export default AspectRoute.extend({
  guiUtils: service(),

  onepanelServiceType: reads('guiUtils.serviceType'),

  /**
   * @override
   */
  beforeModel(transition) {
    const result = this._super(...arguments);
    const resourceType = get(transition.params['onedata.sidebar'], 'type');
    if (resourceType === 'clusters') {
      this._redirectClusterAspect(transition);
    }
    return result;
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
    if (aspectId !== 'not-found' && aspectId !== 'installation') {
      const onepanelServiceType = this.get('onepanelServiceType');
      const contentModel = this.modelFor('onedata.sidebar.content');
      if (get(contentModel, 'resource.isNotDeployed')) {
        this.transitionTo('onedata.sidebar.content.aspect', 'installation');
      } else if (onepanelServiceType === 'onezone' && !zoneAspects.has(aspectId)) {
        this.transitionTo('onedata.sidebar.content.aspect', 'overview');
      }
    }
  },
});
