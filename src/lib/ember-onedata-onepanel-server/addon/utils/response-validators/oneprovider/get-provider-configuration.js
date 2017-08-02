/**
 * Validate ProviderConfiguration 
 *
 * @module utils/response-validators/get-provider-configuration
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

export default function (data) {
  return !!(typeof data.cluster === 'object' && data.oneprovider);
}
