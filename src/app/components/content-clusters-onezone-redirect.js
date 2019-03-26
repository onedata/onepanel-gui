/**
 * Redirects to to Onezone app on init showing loader spinner
 * 
 * @module components/content-clusters-onezone-redirect
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { resolve } from 'rsvp';

export default Component.extend({
  onezoneGui: service(),

  /**
   * @virtual
   * @type {string}
   */
  path: '',

  fetchOnezoneOrigin() {
    return resolve();
  },

  init() {
    this._super(...arguments);
    this.redirectToOnezone();
  },

  redirectToOnezone() {
    const onezoneOrigin = this.get('onezoneGui.onezoneOrigin');
    return new Promise(() => {
      window.location =
        `${onezoneOrigin}/ozw/onezone/i#/${this.get('path')}`;
    });
  },
});
