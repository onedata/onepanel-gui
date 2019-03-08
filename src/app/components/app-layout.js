import AppLayout from 'onedata-gui-common/components/app-layout';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';

export default AppLayout.extend({
  media: service(),
  deploymentManager: service(),
  onepanelServer: service(),

  isStandaloneOnepanel: reads('onepanelServer.isStandalone'),

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
    'isStandaloneOnepanel',
    'isDeploying',
    'media.{isDesktop,isTablet}',
    function withBottomBar() {
      return this.get('isDeploying') && this.get('isStandaloneOnepanel') && (
        this.get('media.isDesktop') || this.get('media.isTablet')
      );
    }
  ),
});
