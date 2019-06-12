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
import { Promise } from 'rsvp';

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
      const urlClusterId =
        get(transition, 'params')['onedata.sidebar.content']['resource_id'];
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
            const origin = `https://${get(model, 'resource.domain')}:9443`;
            return checkImg(`${origin}/favicon.ico`)
              .then(isAvailable => {
                let redirectUrl;
                if (isAvailable) {
                  redirectUrl = onezoneGui.getOnepanelNavUrlInOnezone({
                    clusterId,
                    internalRoute: `/onedata/clusters/${clusterId}`,
                  });
                } else {
                  redirectUrl = onezoneGui.getUrlInOnezone(
                    `onedata/clusters/${clusterId}/endpoint-error`
                  );
                }
                return new Promise(() => {
                  window.location = redirectUrl;
                });
              });
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
