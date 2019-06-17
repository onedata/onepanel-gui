/**
 * An authenticator for `ember-simple-auth` that uses Onepanel REST API
 * by using `onepanel-server` service
 *
 * @module authenticators/onepanel-rest
 * @author Jakub Liput
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { inject as service } from '@ember/service';

import { Promise, resolve, reject } from 'rsvp';

import BaseAuthenticator from 'ember-simple-auth/authenticators/base';

export default BaseAuthenticator.extend({
  onepanelServer: service('onepanelServer'),

  /**
   * Just pass authenticated data from session-store
   * @param {object} data a handshake data
   * @returns {Promise<object>} resolves with passed data
   */
  restore(data) {
    return Promise.resolve(data);
  },

  authenticate({ password }) {
    return this.get('onepanelServer').login(password);
  },

  invalidate() {
    return new Promise((resolve, reject) => {
      $.ajax('/logout', {
        method: 'POST',
      }).then(resolve, reject);
    }).catch(error => {
      if (error && error.response && error.response.statusCode === 401) {
        resolve();
      } else {
        reject(error);
      }
    });
  },
});
