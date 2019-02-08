/**
 * Adds redirect to another clusters
 *
 * @module routes/onedata/sidebar/content
 * @author Michal Borzecki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import SidebarContentRoute from 'onedata-gui-common/routes/onedata/sidebar/content';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import checkImg from 'onedata-gui-common/utils/check-img';

export default SidebarContentRoute.extend({
  clusterModelManager: service(),
  onepanelServer: service(),
  navigationState: service(),
  onezoneGui: service(),
  globalNotify: service(),

  afterModel(model, transition) {
    const result = this._super(...arguments);
    if (this.get('navigationState.activeResourceType') === 'clusters') {
      const {
        clusterModelManager,
        onezoneGui,
      } = this.getProperties(
        'clusterModelManager',
        'onezoneGui'
      );

      const currentClusterId = get(clusterModelManager, 'currentClusterProxy.id') ||
        'new-cluster';
      const urlClusterId =
        get(transition, 'params')['onedata.sidebar.content']['resource_id'];
      const clusterId = get(model, 'resourceId') ||
        (urlClusterId === 'new-cluster' ? urlClusterId : null);

      if (clusterId !== currentClusterId) {
        if (clusterId === 'new-cluster') {
          return this.transitionTo('onedata.sidebar.content', currentClusterId);
        } else {
          // If selected cluster is different than this cluster, redirect to
          // another Onepanel if possible. If Onezone is not available, then
          // redirect to main page.
          if (get(onezoneGui, 'zoneDomain')) {

            return checkImg(`https://${get(model, 'resource.domain')}:9443/favicon.ico`)
              .then(isAvailable => {
                if (isAvailable) {
                  const redirectUrl = onezoneGui.getOnepanelNavUrlInOnezone({
                    onepanelType: get(model, 'resource.type'),
                    clusterId,
                    internalRoute: `/onedata/clusters/${clusterId}`,
                  });
                  window.location = redirectUrl;
                } else {
                  // FIXME: design of not available domain and text
                  this.get('globalNotify').backendError('reading cluster endpoint');
                  throw new Error(
                    'Selected cluster domain is not available for your web browser.'
                  );
                }
              });
          } else {
            this.transitionTo('onedata');
          }
        }
      }
    }
    return result;
  },
});
