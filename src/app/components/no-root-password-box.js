/**
 * A container component for setting first root password
 *
 * @module components/no-root-password-box
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { default as EmberObject, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/login-box';
import safeMethodExecution from 'onedata-gui-common/utils/safe-method-execution';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';

export default Component.extend(I18n, {
  layout,
  classNames: ['login-box', 'no-root-password-box'],

  i18nPrefix: 'components.noRootPasswordBox.',

  globalNotify: service(),
  userManager: service(),
  session: service(),
  onepanelServer: service(),

  /**
   * @type {string} one of: first, create, join
   */
  mode: 'first',

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

  /**
   * @type {Ember.ComputedProperty<PromiseObject<string>>}
   */
  hostnameProxy: computed(function () {
    return PromiseObject.create({
      promise: this.get('onepanelServer')
        .staticRequest('onepanel', 'getNode')
        .then(({ data: { hostname } }) => hostname),
    });
  }),

  init() {
    this._super(...arguments);
    this.set('headerModel', EmberObject.create({}));
  },

  actions: {
    settingPasswordStarted() {
      this.set('isBusy', true);
    },

    settingPasswordSuccess() {
      this.get('globalNotify').info(this.tt('settingPasswordSuccess'));
      safeMethodExecution(this, 'set', 'isBusy', false);
    },

    settingPasswordFailure() {
      safeMethodExecution(this, 'set', 'isBusy', false);
    },

    changeMode(mode) {
      this.set('mode', mode);
    },
  },
});
