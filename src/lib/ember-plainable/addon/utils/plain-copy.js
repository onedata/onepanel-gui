// Original implementation: http://stackoverflow.com/a/15002755

import Ember from 'ember';
import Plainable from 'ember-plainable/mixins/plainable';

/**
 * Somehow hacky method to check if object is Ember Object
 * @param {object|Ember.Object} obj
 * @returns {boolean} true if obj is Ember.Object
 */
function isEmberObject(obj) {
  return obj.reopen !== undefined;
}

export default function plainCopy(obj) {
  if (Ember.isArray(obj)) {
    return obj.map(plainCopy);
  } else if (typeof (obj) === 'object') {
    if (Plainable.detect(obj)) {
      return obj.plainCopy();
    } else if (!isEmberObject(obj)) {
      return obj;
    } else {
      throw new Error(Ember.String.fmt('%@ is not Plainable', [obj]));
    }
  } else {
    return obj;
  }
}
