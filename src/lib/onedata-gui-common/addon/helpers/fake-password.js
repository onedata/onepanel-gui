/**
 * Inserts dots that represents "some unknown password" 
 *
 * @module helpers/fake-password
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

const {
  String: { htmlSafe },
} = Ember;

const PASSWORD_DOT = '&#9679';

export function fakePassword([dotsCount = 5] /*, hash*/ ) {
  return htmlSafe(PASSWORD_DOT.repeat(dotsCount));
}

export default Ember.Helper.helper(fakePassword);