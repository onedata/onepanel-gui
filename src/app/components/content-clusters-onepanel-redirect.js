/**
 * Override opening cluster in Onezone method
 *
 * @author Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { inject as service } from '@ember/service';
import ContentClustersOnepanelRedirect from 'onedata-gui-common/components/content-clusters-onepanel-redirect';
import { Promise } from 'rsvp';
import globals from 'onedata-gui-common/utils/globals';

export default ContentClustersOnepanelRedirect.extend({
  onezoneGui: service(),

  /**
   * @override
   */
  openClusterErrorInOnezone() {
    const {
      onezoneGui,
      clusterId,
    } = this.getProperties('onezoneGui', 'clusterId');
    return new Promise(() => {
      globals.location.replace(onezoneGui.getUrlInOnezone(
        `/onedata/clusters/${clusterId}/endpoint-error`
      ));
    });
  },
});
