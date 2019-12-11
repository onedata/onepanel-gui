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
import extractNestedError from 'onepanel-gui/utils/extract-nested-error';

function isLogoutResponse(response) {
  return response && response.req.method === 'DELETE' &&
    response.req.url.match(/\/session$/) && true;
}

const workerUnavailableErrors = [
  'serviceUnavailable',
  'noConnectionToOnezone',
];

export default Mixin.create({
  session: service(),

  /**
   * @type {Storage}
   */
  _sessionStorage: sessionStorage,

  handleRequestError(errorResponse) {
    if (errorResponse && errorResponse.response && errorResponse.response.statusCode) {
      const statusCode = errorResponse.response.statusCode;
      const body = errorResponse.response.body;
      const error = body && extractNestedError(body.error);
      const noConnectionError = workerUnavailableErrors.includes((error || {}).id);

      if ((statusCode === 503 && !body) || noConnectionError) {
        this.set('workerServicesAreAvailable', false);
      } else if (statusCode === 401 && this.get('isInitialized') &&
        !isLogoutResponse(errorResponse.response)
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
