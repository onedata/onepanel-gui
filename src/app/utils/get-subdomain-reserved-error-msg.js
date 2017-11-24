/**
 * Function that returns error message for 'subdomain reserved' error. 
 * If provided error is not the 'subdomain reserved' error, then empty 
 * string is returned.
 *
 * @module utils/get-subdomain-reserver-error-msg
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.

 * @param {object} errorResponse error response (probably from rejected promise)
 * @returns {string} error message
 */
export default function (errorResponse) {
  const errorHosts = errorResponse && errorResponse.response &&
    errorResponse.response.body && errorResponse.response.body.hosts;
  if (errorHosts) {
    let msg = '';
    Object.keys(errorHosts).forEach(host => {
      const hostError = errorHosts[host];
      if (hostError && hostError.error === 'Subdomain reserved error') {
        msg = hostError.description;
      }
    });
    return msg;
  } else {
    return '';
  }
}
