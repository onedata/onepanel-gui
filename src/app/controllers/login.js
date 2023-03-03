/**
 * Support for emergency warning bar
 *
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({
  eventsBus: service(),

  emergencyWarningBarVisible: false,

  init() {
    this._super(...arguments);
    this.get('eventsBus').on(
      'login-controller:toggleEmergencyWarningBar',
      open => this.toggleEmergencyWarningBar(open)
    );
  },

  destroy() {
    try {
      this.get('eventsBus').off('login-controller:toggleEmergencyWarningBar');
    } finally {
      this._super(...arguments);
    }
  },

  toggleEmergencyWarningBar(open) {
    this.set('emergencyWarningBarVisible', open);
  },
});
