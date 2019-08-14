/**
 * Provides methods for handling backend request errors 
 *
 * @module mixins/request-error-handler
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Mixin from '@ember/object/mixin';
import { inject as service } from '@ember/service';
import { sessionExpiredKey } from 'onedata-gui-common/components/login-box';
import { get } from '@ember/object';

function isLogoutResponse(response) {
  return response && response.req.method === 'DELETE' &&
    response.req.url.match(/\/session$/) && true;
}

export default Mixin.create({
  session: service(),

  /**
   * @type {Storage}
   */
  _sessionStorage: sessionStorage,

  handleRequestError(error) {
    if (error && error.response && error.response.statusCode) {
      const statusCode = error.response.statusCode;
      
      if (statusCode === 503) {
        // 503 means that oz/op-worker is unavailable
        this.set('workerServicesAreAvailable', false);
      } else if (statusCode === 401 && this.get('isInitialized') &&
        !isLogoutResponse(error.response)
      ) {
        // 401 should not be present when isInitialized - it seems that session has expired
        this._handleUnauhtorizedError();
      }
    }
  },

  _handleUnauhtorizedError() {
    const session = this.get('session');
    if (get(session, 'isAuthenticated')) {
      const _sessionStorage = this.get('_sessionStorage');
      _sessionStorage.setItem(sessionExpiredKey, '1');
    }
    session.invalidate().then(() => {
      this.destroyClient();
    });
  },
});
