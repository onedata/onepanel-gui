// Original implementation: http://stackoverflow.com/a/15002755

import Ember from 'ember';
import plainCopy from 'ember-plainable/utils/plain-copy';

export default Ember.Mixin.create({
  plainCopy: function () {
    var props = Object.keys(this);
    var proto = this.constructor.prototype;
    for (let p in proto) {
      if (proto.hasOwnProperty(p) && typeof (this[p]) !== "function") {
        props.push(p);
      }
    }
    var copy = {};
    props.forEach(function (p) {
      copy[p] = plainCopy(this.get(p));
    }, this);
    return copy;
  }
});
