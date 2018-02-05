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

/**
 * @param {string} url 
 * @returns {Promise} resolves if data from URL is get successfully
 */
function _tryGet(url) {
  return $.get(url).promise();
}

/**
 * Read current location and change the domain of it (hostname)
 * First check if valid data can be GET from the new location
 * @param {string} domain
 * @param {object} [options]
 * @param {Location} [options.location]
 * @param {function} [options.tryGet] `function(url: string): Promise`
 *    the result promise should resolve when GET on URL succeeded
 * @returns {Promise} rejects when cannot GET data from new location (try multiple
 *    times)
 */
export default function changeDomain(domain, options) {
  let _options = options;
  if (!_options) {
    _options = {};
  }
  if (!_options.location) {
    _options.location = window.location;
  }
  if (!_options.tryGet) {
    _options.tryGet = _tryGet;
  }
  if (!_options.tryCount) {
    _options.tryCount = 10;
  }
  if (!_options.tryInterval) {
    _options.tryInterval = 1000;
  }

  const currentLocation = _options.location.toString();
  const newLocation = currentLocation.replace(
    /(https?:\/\/)(.*?)((:\d+)?\/.*)/g,
    `$1${domain}$3`
  );
  return tryUntilResolve(() =>
      _options.tryGet(newLocation), _options.tryCount, _options.tryInterval
    )
    .then(() => {
      if (_options.location.hostname === domain) {
        _options.location.reload();
      } else {
        _options.location.hostname = domain;
      }
    });
}
