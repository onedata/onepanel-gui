/**
 * Adds custom default resource selection to onedata.sidebar.index route
 *
 * @module routes/onedata/sidebar/index
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import SidebarIndexRoute from 'onedata-gui-common/routes/onedata/sidebar/index';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';

export default SidebarIndexRoute.extend({
  clusterModelManager: service(),

  /**
   * @override
   */
  getDefaultResource(list, resourceType) {
    if (resourceType === 'clusters') {
      const first = list[0];
      if (first && get(first, 'id') === 'new') {
        return list[0];
      } else {
        // promise resolve is guaranteed by fetching currentCluster in application route
        return this.get('clusterModelManager.currentCluster');
      }
    } else {
      return this._super(...arguments);
    }
  },
});
