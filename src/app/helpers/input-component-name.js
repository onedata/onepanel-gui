import Ember from 'ember';

export function inputComponentName([ type ]/*, hash*/) {
  switch (type) {
    case 'text':
      return 'one-way-input';
    default:
      return 'one-way-' + type;
  }
}

export default Ember.Helper.helper(inputComponentName);
