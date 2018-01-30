/**
 * Detect if the backend error is one of predefined Let's Encrypt errors
 *
 * @module utils/get-special-lets-encrypt-error
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 *
 * @param {object} error data from backend response
 * @returns {string} type of Let's Encrypt error, one of: Limit, Authorization
 */

import _ from 'lodash';

export const KNOWN_ERRORS = ['Limit', 'Authorization'];

export default function specialLetsEncryptError(error) {
  const errorHosts = error && error.response &&
    error.response.body && error.response.body.hosts;
  if (errorHosts && typeof errorHosts === 'object') {
    for (const host of _.values(errorHosts)) {
      if (host.error) {
        const m = host.error.match(/Let's Encrypt (.*?) Error/);
        if (m && _.includes(KNOWN_ERRORS, m[1])) {
          return m[1];
        }
      }
    }
  }
}
