import Ember from 'ember';

const {
  String: { htmlSafe },
} = Ember;

const PASSWORD_DOT = '&#9679';

export function fakePassword([dotsCount = 5] /*, hash*/ ) {
  return htmlSafe(PASSWORD_DOT.repeat(dotsCount));
}

export default Ember.Helper.helper(fakePassword);
