/**
 * Unpack string with error from onepanel backend rejected request 
 *
 * @module utils/get-error-description
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

const {
  String: { htmlSafe },
  Handlebars: { Utils: { escapeExpression } }
} = Ember;

/**
 * Gets error details from error object that is returned on onepanel backend reject
 * 
 * @export
 * @param {object|string} error
 * @return {Ember.String.htmlSafe}
 */
export default function getErrorDescription(error) {
  let details = error && error.response && error.response.body &&
    (error.response.body.description || error.response.body.error) ||
    error;

  return htmlSafe(escapeExpression(details));
}
