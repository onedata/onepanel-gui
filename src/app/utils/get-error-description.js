/**
 * Generates error description for passed error.
 * NOTICE: It is a temporary error translator. After migrating to GraphSync 
 * Onepanel GUI should use onedata-gui-common/utils/get-error-description directly.
 *
 * @module utils/get-error-description
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { htmlSafe, isHTMLSafe } from '@ember/string';
import { get } from '@ember/object';
import Ember from 'ember';

import commonGetErrorDescription from 'onedata-gui-common/utils/get-error-description';

export default function getErrorDescription(error, i18n) {
  const body = error && error.response && error.response.body;
  const responseError = get(body || {}, 'error');
  if (responseError) {
    return commonGetErrorDescription(responseError, i18n);
  }

  // Fallback, old code which handles errors with undefined body.error.
  const details = body && parseRest(body) || error.message || error;
  let errorJson;
  let message;
  if (typeof details === 'object' && !isHTMLSafe(details)) {
    try {
      errorJson = htmlSafe(Ember.Handlebars.Utils.escapeExpression(
        JSON.stringify(error)
      ));
    } catch (e) {
      if (!(e instanceof TypeError)) {
        throw error;
      }
    }
  } else {
    message = htmlSafe(Ember.Handlebars.Utils.escapeExpression(details));
  }

  return {
    message,
    errorJsonString: errorJson,
  };
}

function parseRest(body) {
  return isSimpleRestError(body) ? simpleRestError(body) : complexRestError(body);
}

function isSimpleRestError(body) {
  const { hosts } = body;

  return !!(hosts && typeof hosts === 'object' && Object.keys(hosts).length === 1);
}

function simpleRestError(body) {
  const { hosts } = body;
  return body.hosts[Object.keys(hosts)[0]].description;
}

function complexRestError(body) {
  const {
    error,
    description,
    'module': errModule,
    'function': errFunction,
    hosts,
  } = body;

  let str = `${error}`;
  if (description) {
    str += `: ${description.replace(/\.$/, '')}. `;
  }
  if (errFunction && errModule) {
    `Appeared in function ${errFunction} in module ${errModule}. `;
  }
  if (hosts && typeof hosts === 'object') {
    for (const hostname in hosts) {
      const { error: hostError, description: hostDescription } = hosts[hostname];
      str +=
        `Service on host ${hostname} failed with ${hostError}: ${hostDescription.replace(/\.$/, '')}. `;
    }
  }
  return str;
}
