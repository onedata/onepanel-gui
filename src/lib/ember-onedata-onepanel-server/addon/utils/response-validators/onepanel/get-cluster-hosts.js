/**
 * Validate cluster hosts list 
 *
 * @module utils/response-validators/onepanel/get-cluster-hosts
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */
export default function (data) {
  return Array.isArray(data);
}
