/**
 * An extension of PrivacyPolicyManager service from onedata-gui-common that
 * specifies privacy policy location: in Onezone if Onepanel is hosted, or
 * unavailable if Onepanel is in emergency mode.
 *
 * @module services/privacy-policy-manager
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import PrivacyPolicyManager from 'onedata-gui-common/services/privacy-policy-manager';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';

export default PrivacyPolicyManager.extend({
  onepanelServer: service(),
  onezoneGui: service(),

  /**
   * @override
   */
  showPrivacyPolicyAction: computed(
    'onepanelServer.isHosted',
    function showPrivacyPolicyAction() {
      if (this.get('onepanelServer.isHosted')) {
        return () => this.get('onezoneGui').getUrlInOnezone('/?show_privacy_policy=true');
      } else {
        return undefined;
      }
    }
  ),
});
