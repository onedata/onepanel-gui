/**
 * A component when available login options should be presented
 *
 * @module components/login-box
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

const {
  inject: {
    service
  },
  computed: {
    readOnly
  }
} = Ember;

// TODO: fake session, do it better with ember session

export default Ember.Component.extend({
  classNames: ['login-box'],

  globalNotify: service(),
  onepanelServer: service(),

  authLoadingPromise: readOnly('onepanelServer.sessionValidator.promise'),

  isLoading: readOnly('authLoadingPromise.isPending'),
  isBusy: false,

  init() {
    this._super(...arguments);
    let authLoading = this.get('authLoadingPromise');
    authLoading.then(() => this.send('authenticationSuccess'));
    authLoading.catch(() => this.send('authenticationFailure'));
  },

  actions: {
    authenticationStarted() {
      this.set('isBusy', true);
    },

    authenticationSuccess() {
      this.get('globalNotify').success('Authentication succeeded!');
      this.sendAction('authenticationSuccess');
      this.set('isBusy', false);
    },

    authenticationFailure() {
      this.get('globalNotify').warning('Authentication failed!');
      this.set('isBusy', false);
    }
  }
});
