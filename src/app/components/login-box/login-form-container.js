/**
 * Special version of login form container for Onepanel,
 * with "Login with Onezone" button.
 * 
 * @module components/login-box/login-form-container
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import LoginFormContainer from 'onedata-gui-common/components/login-box/login-form-container';
import layout from '../../templates/components/login-box/login-form-container';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import { computed, get } from '@ember/object';

export default LoginFormContainer.extend(I18n, {
  layout,

  i18nPrefix: 'components.loginBox.loginFormContainer',

  globalNotify: service(),
  onepanelServer: service(),
  onezoneGui: service(),
  onepanelConfiguration: service(),

  /**
   * Url to onepanel gui hosted by onezone or null if onezone is not available
   * @type {Ember.ComputedProperty<string|null>}
   */
  visitViaOnezoneUrl: computed(
    'onezoneGui.canEnterViaOnezone',
    function visitViaOnezoneUrl() {
      const onezoneGui = this.get('onezoneGui');
      const canEnterViaOnezone = get(onezoneGui, 'canEnterViaOnezone');

      if (canEnterViaOnezone) {
        return onezoneGui.getOnepanelNavUrlInOnezone();
      } else {
        return null;
      }
    }
  ),

  init() {
    this._super(...arguments);
    this.get('onezoneGui').updateEnterViaOnezoneProxy();
  },
});
