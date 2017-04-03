/**
 * Remove object keys that have specific values
 *
 * Works only on flat objects - does not go recursively!
 * The comparison is done by indexOf (so by ``===`` operator).
 *
 * @module utils/strip-object
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */
export default function stripObject(orig, falsyValues = [undefined, null]) {
  let stripped = {};
  for (let key in orig) {
    if (falsyValues.indexOf(orig[key]) === -1) {
      stripped[key] = orig[key];
    }
  }
  return stripped;
}
