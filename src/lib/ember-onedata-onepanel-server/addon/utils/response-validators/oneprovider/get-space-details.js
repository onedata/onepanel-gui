/**
 * Validate SpaceDetails data
 *
 * @module utils/response-validators/oneprovider/get-space-details
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */
export default function (data) {
  try {
    return !!(
      data.id &&
      data.name &&
      typeof data.supportingProviders === 'object'
    );
  } catch (error) {
    return false;
  }
}
