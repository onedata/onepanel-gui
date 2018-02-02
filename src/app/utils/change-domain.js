/**
 * Change domain in browser window with testing if the domain serves a valid
 * response first. 
 *
 * @module utils/change-domain
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 *
 * @param {string} domain new hostname
 * @param {Location} [location]
 * @param {function} getUrl returns a promise which resolve if data was fetched successfully
 * @returns {undefined}
 */

import tryUntilResolve from 'onedata-gui-common/utils/try-until-resolve';

import $ from 'jquery';

function tryGet(url) {
  return $.get(url).promise();
}

export default function changeDomain(domain, location = window.location, getUrl = tryGet) {
  const currentLocation = window.location.toString();
  const newLocation = currentLocation.replace(
    /(https?:\/\/)(.*?)(\/.*)/g,
    `$1${domain}$3`
  );
  return tryUntilResolve(() => getUrl(newLocation), 10, 1000)
    .then(() => {
      if (location.hostname === domain) {
        location.reload();
      } else {
        location.hostname = domain;
      }
    });
}
