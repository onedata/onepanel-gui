// import CookieStore from 'ember-simple-auth/session-stores/cookie';

// export default CookieStore.extend();

/**
 * Base for development and production, "fake" store for session: it does not
 * use local session data, but on each restore, try to use browser session
 * (cookies) to make a handshake it will response with session data.
 *
 * This is because, we do not have any information about session in browser
 * (session_id cookie is server-only)
 *
 * @module session-stores/-base
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { Promise } from 'rsvp';
import BaseSessionStore from 'ember-simple-auth/session-stores/base';
import { inject as service } from '@ember/service';
import _ from 'lodash';

export default BaseSessionStore.extend({
  onepanelServer: service(),

  /**
   * @virtual
   * @returns {Promise<undefined>}
   */
  forceCloseConnection() {
    throw new Error('not implemented');
  },

  /**
   * @virtual
   * @returns {Promise<undefined>}
   */
  tryHandshake() {
    throw new Error('not implemented');
  },

  persist( /* data */ ) {
    // complete ignore of persist - the "store" is remote server
    return Promise.resolve();
  },

  restore() {
    const gettingRestCredentials = this.get('onepanelServer').validateSession();
    return new Promise(resolve => {
      gettingRestCredentials.then(({ username, token }) =>
        resolve({
          authenticated: _.merge({ username, token }, { authenticator: 'authenticator:application' }),
        })
      );
      gettingRestCredentials.catch(() => resolve({}));
    });
  },
});
