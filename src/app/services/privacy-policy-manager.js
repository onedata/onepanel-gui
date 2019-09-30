/**
 * An extension of PrivacyPolicyManager service from onedata-gui-common.
 *
 * @module services/privacy-policy-manager
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import PrivacyPolicyManager from 'onedata-gui-common/services/privacy-policy-manager';

export default PrivacyPolicyManager.extend({
  /**
   * @override
   */
  showPrivacyPolicyAction: undefined,
});
