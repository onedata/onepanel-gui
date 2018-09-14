/**
 * FIXME: docs
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

export default LoginFormContainer.extend(I18n, {
  layout,

  i18nPrefix: 'components.loginBox.loginFormContainer',

  globalNotify: service(),
  onepanelServer: service(),

  redirectToOnezoneLogin(url) {
    window.location = url;
  },

  actions: {
    loginWithOnezone() {
      return this.get('onepanelServer').getOnezoneLogin()
        .then(({ url }) => {
          this.redirectToOnezoneLogin(url);
        })
        .catch(error => {
          this.get('globalNotify').backendError(this.t('gettingOnezoneLogin'),
            error);
          throw error;
        });
    },
  },
});
