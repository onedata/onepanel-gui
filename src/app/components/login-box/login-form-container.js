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
    'onezoneGui.isOnezoneAvailableProxy.content',
    'onepanelConfiguration.clusterId',
    'onepanelServer.serviceType',
    function visitViaOnezoneUrl() {
      const {
        onezoneGui,
        onepanelConfiguration,
        onepanelServer,
      } = this.getProperties(
        'onezoneGui',
        'onepanelConfiguration',
        'onepanelServer'
      );
      const isOnezoneAvailable =
        get(onezoneGui, 'isOnezoneAvailableProxy.content');
      
      if (isOnezoneAvailable) {
        const onepanelType = get(onepanelServer, 'serviceType');
        const clusterId = get(onepanelConfiguration, 'clusterId');
        return onezoneGui.getOnepanelNavUrlInOnezone(onepanelType, clusterId);
      } else {
        return null;
      }
    }
  ),
});
