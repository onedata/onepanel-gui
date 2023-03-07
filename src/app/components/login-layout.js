/**
 * Common layout for login view.
 * Onepanel specific - adds emergency warning bar support to layout.
 *
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import LoginLayout from 'onedata-gui-common/components/login-layout';

export default LoginLayout.extend({
  classNameBindings: ['withEmergencyWarningBar:with-emergency-warning-bar'],

  /**
   * @virtual
   * @type {boolean}
   */
  withEmergencyWarningBar: false,
});
