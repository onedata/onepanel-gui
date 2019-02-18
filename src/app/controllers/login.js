/**
 * Support for standalone warning bar
 * 
 * @module controllers/login
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({
  eventsBus: service(),

  standaloneWarningBarVisible: false,

  init() {
    this._super(...arguments);
    this.get('eventsBus').on(
      'login-controller:toggleStandaloneWarningBar',
      open => this.toggleStandaloneWarningBar(open)
    );
  },

  destroy() {
    try {
      this.get('eventsBus').off('login-controller:toggleStandaloneWarningBar');
    } finally {
      this._super(...arguments);
    }
  },

  toggleStandaloneWarningBar(open) {
    this.set('standaloneWarningBarVisible', open);
  },
});
