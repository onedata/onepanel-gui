/**
 * Validate ZoneConfiguration 
 *
 * @module utils/response-validators/oneprovider/get-zone-configuration
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */
export default function (data) {
  try {
    return !!(typeof data.cluster === 'object' && data.onezone);
  } catch (error) {
    if (error instanceof TypeError) {
      return false;
    } else {
      throw error;
    }
  }
}
