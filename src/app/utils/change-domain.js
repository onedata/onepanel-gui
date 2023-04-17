/**
 * Change domain in browser window with delay
 *
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { Promise } from 'rsvp';
import globals from 'onedata-gui-common/utils/globals';

const DEFAULT_DELAY = 5000;

/**
 * Read current location and change the domain of it (hostname) with delay
 * @param {string} domain
 * @param {object} [options]
 * @param {number} [options.delay=5000]
 * @returns {Promise} rejects on change location error
 */
export default function changeDomain(domain, options) {
  let _options = options;
  if (!_options) {
    _options = {};
  }
  if (!_options.delay) {
    _options.delay = DEFAULT_DELAY;
  }
  return new Promise((resolve, reject) => {
    try {
      setTimeout(() => {
        if (globals.location.hostname === domain) {
          globals.location.reload();
        } else {
          globals.location.hostname = domain;
        }
        resolve();
      }, _options.delay);
    } catch (error) {
      reject(error);
    }
  });
}
