/**
 * Validate SpaceDetailsAutoCleaningStatus data
 *
 * @module utils/response-validators/oneprovider/get-provider-space-auto-cleaning-status
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @function
 * @param {object} data response data
 * @returns {boolean} true if response data is valid
 */
export default function (data) {
  try {
    return typeof data.isWorking === 'boolean' &&
      typeof data.spaceUsed === 'number';
  } catch (error) {
    if (error instanceof TypeError) {
      return false;
    } else {
      throw error;
    }
  }
}
