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

export default SidebarContentRoute.extend({
  clusterModelManager: service(),
  onepanelServer: service(),
  navigationState: service(),
  onezoneGui: service(),

  afterModel(model, transition) {
    const result = this._super(model, transition);
    const {
      clusterModelManager,
      navigationState,
      onezoneGui,
    } = this.getProperties(
      'clusterModelManager',
      'navigationState',
      'onezoneGui'
    );

    if (get(navigationState, 'activeResourceType') === 'clusters') {
      const currentClusterId =
        get(clusterModelManager, 'currentClusterProxy.id') || 'new';
      const clusterId = get(model, 'resourceId');

      // If selected cluster is different than this cluster, redirect to
      // another Onepanel.
      if (clusterId !== currentClusterId) {
        const redirectUrl = onezoneGui.getOnepanelNavUrlInOnezone(
          get(model, 'resource.type'),
          get(model, 'resourceId'),
          `/onedata/clusters/${clusterId}`
        );
        window.location = redirectUrl;
      }
    }
    return result;
  },
});
