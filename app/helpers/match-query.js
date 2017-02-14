import Ember from 'ember';

export function matchQuery([ label, query ]/*, hash*/) {
  return !query || new RegExp(query).test(label);
}

export default Ember.Helper.helper(matchQuery);
