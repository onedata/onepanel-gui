/**
 * Remove object keys that have undefined or null values
 *
 * Works only on flat objects - does not go recursively!
 *
 * @module utils/strip-object
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */
export default function stripObject(orig) {
  let stripped = {};
  for (let key in orig) {
    if (orig[key] != null) {
      stripped[key] = orig[key];
    }
  }
  return stripped;
}
