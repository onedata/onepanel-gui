/**
 * Validate spaces list data
 *
 * @module utils/response-validators/oneprovider/get-provider-spaces
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
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
