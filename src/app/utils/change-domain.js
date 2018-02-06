/**
 * Change domain in browser window with delay
 *
 * @module utils/change-domain
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { Promise } from 'rsvp';

const DEFAULT_DELAY = 5000;

/**
 * Read current location and change the domain of it (hostname) with delay
 * @param {string} domain
 * @param {object} [options]
 * @param {Location} [options.location=window.location]
 * @param {number} [options.delay=5000]
 * @returns {Promise} rejects on change location error
 */
export default function changeDomain(domain, options) {
  let _options = options;
  if (!_options) {
    _options = {};
  }
  if (!_options.location) {
    _options.location = window.location;
  }
  if (!_options.delay) {
    _options.delay = DEFAULT_DELAY;
  }
  return new Promise((resolve, reject) => {
    try {
      setTimeout(() => {
        if (_options.location.hostname === domain) {
          _options.location.reload();
        } else {
          _options.location.hostname = domain;
        }
        resolve();
      }, _options.delay);
    } catch (error) {
      reject(error);
    }
  });
}
