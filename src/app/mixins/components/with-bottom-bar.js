/**
 * Adds bottom bar layout feature
 * 
 * @module components/with-bottom-bar
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Mixin from '@ember/object/mixin';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default Mixin.create({
  classNameBindings: ['withBottomBar:with-bottom-bar'],

  media: service(),
  deploymentManager: service(),
  onepanelServer: service(),

  isEmergencyOnepanel: reads('onepanelServer.isEmergency'),

  /**
   * Deployment manager's installationDetails should be available always
   * in `onedata` routes because it is blocking `onedata` model.
   * @type {ComputedProperty<boolean>}
   */
  isDeploying: computed(
    'deploymentManager.installationDetails.isInitialized',
    function isDeploying() {
      return this.get('deploymentManager.installationDetails.isInitialized') ===
        false;
    },
  ),

  /**
   * @type {ComputedProperty<boolean>}
   */
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
