/**
 * Creates JS plain object from given EmberObject
 *
 * Based on implementation: http://stackoverflow.com/a/15002755
 * NOTE that it will not clone object deeply, but just copy references
 *
 * @module utils/plain-copy
 * @author Jakub Liput, qrilka from Stack Overflow
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { isArray } from '@ember/array';
import { get } from '@ember/object';

// TODO: WARNING this function does not clone object deeply, 
// it will just return always a plain object

function emberObjPlainCopy(emberObj) {
  var props = Object.keys(emberObj);
  var proto = emberObj.constructor.prototype;
  for (let p in proto) {
    if (proto.hasOwnProperty(p) && typeof (emberObj[p]) !== 'function') {
      props.push(p);
    }
  }
  var copy = {};
  props.forEach(function (p) {
    copy[p] = plainCopy(get(emberObj, p));
  }, emberObj);
  return copy;
}

export default function plainCopy(obj) {
  if (isArray(obj)) {
    return obj.map(plainCopy);
  } else if (obj && (typeof obj === 'object')) {
    return emberObjPlainCopy(obj);
  } else {
    return obj;
  }
}