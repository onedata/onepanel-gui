/**
 * Change domain in browser window with timeout
 *
 * @module utils/change-domain
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 *
 * @param {string} domain new hostname
 * @param {Location} [location]
 * @returns {undefined}
 */

import { Promise } from 'rsvp';

/**
 * Read current location and change the domain of it (hostname) with timeout
 * @param {string} domain
 * @param {object} [options]
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
  if (!_options.timeout) {
    _options.timeout = 5000;
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
      }, _options.timeout);
    } catch (error) {
      reject(error);
    }
  });
}
