/**
 * Adds redirect to another clusters
 *
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import SidebarContentRoute from 'onedata-gui-common/routes/onedata/sidebar/content';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import { Promise } from 'rsvp';
import findRouteInfo from 'onedata-gui-common/utils/find-route-info';

export default SidebarContentRoute.extend({
  onepanelServer: service(),
  clusterModelManager: service(),
  navigationState: service(),
  onezoneGui: service(),
  alert: service(),

  afterModel(model, transition) {
    const result = this._super(...arguments);
    if (this.get('navigationState.activeResourceType') === 'clusters') {
      const {
        clusterModelManager,
        onezoneGui,
        onepanelServer,
      } = this.getProperties(
        'clusterModelManager',
        'onezoneGui',
        'onepanelServer'
      );

      const currentClusterId = get(clusterModelManager, 'currentClusterProxy.id') ||
        'new-cluster';
      const contentRouteInfo = findRouteInfo(transition, 'onedata.sidebar.content');
      const urlClusterId = contentRouteInfo.params['resource_id'];
      const clusterId = get(model, 'resourceId') ||
        (urlClusterId === 'new-cluster' ? urlClusterId : null);

      if (clusterId !== currentClusterId) {
        if (clusterId === 'new-cluster') {
          return this.transitionTo('onedata.sidebar.content', currentClusterId);
        } else if (onepanelServer.get('isEmergency')) {
          return this.transitionTo('onedata.sidebar.index');
        } else if (!get(model, 'resource')) {
          return new Promise(() => {
            window.location.replace(onezoneGui.getUrlInOnezone(
              `onedata/clusters/${urlClusterId}/not-found`
            ));
          });
        } else {
          // If selected cluster is different than this cluster, redirect to
          // another Onepanel if possible. If Onezone is not available, then
          // redirect to main page.
          if (get(onezoneGui, 'zoneDomain')) {
            return this.transitionTo(
              'onedata.sidebar.content.aspect',
              urlClusterId,
              'redirect',
            );
          } else {
            return this.transitionTo('onedata');
          }
        }
      }
    } else {
      return result;
    }
  },
});
