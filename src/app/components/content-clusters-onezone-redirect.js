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
import { Promise, resolve } from 'rsvp';
import { getOnezoneUrl } from 'onedata-gui-common/utils/onedata-urls';

export default Component.extend({
  onezoneGui: service(),

  /**
   * @virtual
   * @type {string}
   */
  path: '',

  /**
   * @type {boolean}
   */
  replace: false,

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
      const url = getOnezoneUrl(onezoneOrigin, this.get('path'));
      if (this.get('replace')) {
        window.location.replace(url);
      } else {
        window.location = url;
      }
    });
  },
});
