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
} = Ember;

// TODO: fake session, do it better with ember session

export default Ember.Component.extend({
  classNames: ['login-box'],

  globalNotify: service(),
  onepanelServer: service(),

  isBusy: false,

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
      this.set('isBusy', false);
    }
  }
});
