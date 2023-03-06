/**
 * Validate storage list data
 *
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 *
 * @function
 * @param {object} data response data
 * @returns {boolean} true if response data is valid
 */
export default function (data) {
  try {
    return Array.isArray(data.ids);
  } catch (error) {
    if (error instanceof TypeError) {
      return false;
    } else {
      throw error;
    }
  }
}
