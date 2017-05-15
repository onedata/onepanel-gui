import Ember from 'ember';

export function dataType([ data ]/*, hash*/) {
  return typeof data;
}

export default Ember.Helper.helper(dataType);
