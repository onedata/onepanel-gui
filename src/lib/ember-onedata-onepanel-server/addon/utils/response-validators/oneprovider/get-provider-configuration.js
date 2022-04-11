/**
 * Validate ProviderConfiguration 
 *
 * @module utils/response-validators/oneprovider/get-provider-configuration
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 *
 * @function
 * @param {object} data response data
 * @returns {boolean} true if response data is valid
 */
export default function (data) {
  const { cluster, oneprovider } = data;
  try {
    return !!(
      typeof cluster === 'object' &&
      Array.isArray(cluster.databases.hosts) &&
      Array.isArray(cluster.managers.hosts) &&
      cluster.managers.mainHost &&
      Array.isArray(cluster.workers.hosts) &&
      'name' in oneprovider
    );
  } catch (error) {
    if (error instanceof TypeError) {
      return false;
    } else {
      throw error;
    }
  }
}
