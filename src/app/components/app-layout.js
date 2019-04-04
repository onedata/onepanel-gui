/**
 * Main layout and components of application in authenticated mode
 * 
 * @module components/app-layout
 * @author Jakub Liput
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import AppLayout from 'onedata-gui-common/components/app-layout';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';

export default AppLayout.extend({
  media: service(),
  deploymentManager: service(),
  onepanelServer: service(),

  isEmergencyOnepanel: reads('onepanelServer.isEmergency'),

  /**
   * Deployment manager's installationDetails should be available always
   * in `onedata` routes because it is blocking `onedata` model.
   */
  isDeploying: computed(
    'deploymentManager.installationDetails.isInitialized',
    function isDeploying() {
      return this.get('deploymentManager.installationDetails.isInitialized') ===
        false;
    },
  ),

  withBottomBar: computed(
    'isEmergencyOnepanel',
    'isDeploying',
    'media.{isDesktop,isTablet}',
    function withBottomBar() {
      return this.get('isDeploying') && this.get('isEmergencyOnepanel') && (
        this.get('media.isDesktop') || this.get('media.isTablet')
      );
    }
  ),
});
