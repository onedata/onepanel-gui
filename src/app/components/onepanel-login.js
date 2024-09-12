/**
 * Main authentication screen component for Onepanel that is intended to be directly used
 * by route template.
 *
 * @author Jakub Liput
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import OnepanelLoginViewModel from 'onepanel-gui/utils/onepanel-login-view-model';

export default Component.extend({
  /**
   * @virtual
   * @type {boolean}
   */
  isEmergencyWarningBarVisible: undefined,

  /**
   * @virtual
   * @type {boolean}
   */
  isEmergencyPassphraseSet: undefined,

  init() {
    this._super(...arguments);
    this.set('loginViewModel', OnepanelLoginViewModel.create({ ownerSource: this }));
  },
});
