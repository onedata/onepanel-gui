/**
 * A container component for creating first admin user
 *
 * @module components/create-admin-box
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/login-box';
import safeMethodExecution from 'onedata-gui-common/utils/safe-method-execution';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  layout,
  classNames: ['login-box', 'create-admin-box'],

  i18nPrefix: 'components.createAdminBox.',

  globalNotify: service(),
  userManager: service(),
  session: service(),

  /**
   * Description for error (if occurred).
   * @type {string|undefined}
   */
  errorMessage: undefined,

  /**
   * If true, data necessary to render login-box is still loading
   * @type {boolean}
   */
  isLoading: false,

  /**
   * Data object passed to the login-box header component
   * @type {EmberObject}
   */
  headerModel: undefined,

  isBusy: false,

  init() {
    this._super(...arguments);
    this.set('headerModel', EmberObject.create({}));
  },

  actions: {
    registerStarted() {
      this.set('isBusy', true);
    },

    registerSuccess() {
      this.get('globalNotify').info(this.tt('registerSuccess'));
      safeMethodExecution(this, 'set', 'isBusy', false);
    },

    registerFailure() {
      safeMethodExecution(this, 'set', 'isBusy', false);
    },
  },
});
