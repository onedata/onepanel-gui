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
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { resolve } from 'rsvp';
import BaseSessionStore from 'ember-simple-auth/session-stores/base';
import { inject as service } from '@ember/service';
import _ from 'lodash';

export default BaseSessionStore.extend({
  onepanelServer: service(),

  persist( /* data */ ) {
    // complete ignore of persist - the "store" is remote server
    return resolve();
  },

  restore() {
    return this.get('onepanelServer').validateSession()
      .then(({ username, token }) => ({
        authenticated: _.merge({ username, token }, { authenticator: 'authenticator:application' }),
      }))
      .catch(() => ({}));
  },
});
