/**
 * Provides methods for handling backend request errors
 *
 * @author Jakub Liput
 * @copyright (C) 2017-2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Mixin from '@ember/object/mixin';
import { inject as service } from '@ember/service';
import { sessionExpiredKey } from 'onedata-gui-common/components/login-box';
import { get } from '@ember/object';
import extractNestedError from 'onepanel-gui/utils/extract-nested-error';
import globals from 'onedata-gui-common/utils/globals';

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
  guiContext: service(),
  onezoneGui: service(),
  onepanelServer: service(),
  router: service(),

  async handleRequestError(errorResponse) {
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
        // 401 should not be present when isInitialized - it seems that x-auth-token
        // has expired
        await this._handleUnauhtorizedError();
      }
    }
  },

  async _handleUnauhtorizedError() {
    const {
      session,
      router,
      onezoneGui,
      onepanelServer,
    } = this.getProperties(
      'session',
      'router',
      'onezoneGui',
      'onepanelServer',
    );
    if (get(onepanelServer, 'isEmergency')) {
      if (get(session, 'isAuthenticated')) {
        globals.sessionStorage.setItem(sessionExpiredKey, '1');
      }
      await session.invalidate();
    } else {
      const onezoneUrl = onezoneGui.getOnepanelNavUrlInOnezone({
        redirectType: 'redirect',
        internalRoute: get(router, 'currentURL'),
      });
      globals.window.location = onezoneUrl;
    }
    this.destroyClient();
  },
});
