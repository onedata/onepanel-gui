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

function isLogoutResponse(response) {
  return response && response.req.method === 'DELETE' &&
    response.req.url.match(/\/session$/) && true;
}

export default Mixin.create({
  session: service(),

  handleRequestError(error) {
    if (error && error.response && error.response.statusCode) {
      // 401 should not be present when isInitialized - it seems that session has expired
      if (error.response.statusCode === 401 && this.get('isInitialized') &&
        !isLogoutResponse(error.response)
      ) {
        this._handleUnauhtorizedError();
      }
    }
  },

  _handleUnauhtorizedError() {
    let session = this.get('session');
    session.invalidate().then(() => {
      this.get('session').set('data.hasExpired', true);
      this.destroyClient();
    });
  },
});
