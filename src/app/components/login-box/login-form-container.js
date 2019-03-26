/**
 * Special version of login form container for Onepanel,
 * with "Login with Onezone" button.
 * 
 * @module components/login-box/login-form-container
 * @author Jakub Liput
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import LoginFormContainer from 'onedata-gui-common/components/login-box/login-form-container';
import layout from '../../templates/components/login-box/login-form-container';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';

const animationTimeout = 333;

export default LoginFormContainer.extend(I18n, createDataProxyMixin('visitViaOnezoneUrl'), {
  layout,

  i18nPrefix: 'components.loginBox.loginFormContainer',

  globalNotify: service(),
  onepanelServer: service(),
  onezoneGui: service(),
  onepanelConfiguration: service(),
  eventsBus: service(),

  /**
   * Timeout id used to control login via Onezone visibility animation.
   * @type {number}
   */
  _onezoneButtonAnimationTimeoutId: -1,

  /**
   * Timeout id used to control form mode change animation.
   * @type {number}
   */
  _formAnimationTimeoutId: -1,

  /**
   * Animation time (visibility toggle animation).
   * @type {number}
   */
  _animationTimeout: animationTimeout,

  isUsernameLoginActive: false,

  /**
   * @override
   * Url to onepanel gui hosted by onezone or null if onezone is not available
   */
  fetchVisitViaOnezoneUrl() {
    const onezoneGui = this.get('onezoneGui');
    return onezoneGui.getCanEnterViaOnezoneProxy()
      .then(canEnterViaOnezone => {
        return canEnterViaOnezone ?
          onezoneGui.getOnepanelNavUrlInOnezone() :
          null;
      });
  },

  init() {
    this._super(...arguments);
    this.updateVisitViaOnezoneUrlProxy().then(onezoneUrl => {
      const isUsernameLoginActive = !onezoneUrl;
      safeExec(this, 'set', 'isUsernameLoginActive', isUsernameLoginActive);
    });
  },

  /**
   * Launches element show animation.
   * @param {jQuery} element
   * @param {boolean} delayed if true, animation will be delayed
   * @returns {undefined}
   */
  _animateShow(element, delayed) {
    element
      .addClass((delayed ? 'short-delay ' : '') + 'fadeIn')
      .removeClass('hide fadeOut');
  },

  /**
   * Launches element hide animation.
   * @param {jQuery} element
   * @returns {undefined}
   */
  _animateHide(element) {
    element.addClass('fadeOut').removeClass('short-delay fadeIn');
  },

  actions: {
    /**
     * Toggles login form mode between username/password and "open with Onezone".
     * @returns {undefined}
     */
    usernameLoginToggle() {
      const {
        _formAnimationTimeoutId,
        _animationTimeout,
      } = this.getProperties(
        '_formAnimationTimeoutId',
        '_animationTimeout'
      );
      const $loginForm = this.$('.basicauth-login-form-container');
      const $onezoneButton = this.$('.onezone-button-container');
      clearTimeout(_formAnimationTimeoutId);

      this.toggleProperty('isUsernameLoginActive');
      const isUsernameLoginActive = this.get('isUsernameLoginActive');

      this.get('eventsBus').trigger(
        'login-controller:toggleEmergencyWarningBar',
        isUsernameLoginActive
      );

      if (isUsernameLoginActive) {
        this._animateHide($onezoneButton);
        this._animateShow($loginForm, true);
        this.$('.login-username').focus();
        // hide dropdown
        this.set('_formAnimationTimeoutId',
          setTimeout(() => $onezoneButton.addClass('hide'), _animationTimeout)
        );
      } else {
        this._animateHide($loginForm);
        this._animateShow($onezoneButton, true);
        this.set('_formAnimationTimeoutId',
          setTimeout(() => $loginForm.addClass('hide'), _animationTimeout)
        );
      }
    },
  },
});
