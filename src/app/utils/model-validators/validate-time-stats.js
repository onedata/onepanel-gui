/**
 * Function to check if TimeStats can be used in chart
 *
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

const REQUIRED_PROPERTIES = [
  'name',
  'lastValueDate',
  'values',
];

/**
 * @param {object} timeStats see TimeStats from onepanel API
 * @returns {boolean} true if timeStats record is valid
 */
export default function validateTimeStats(timeStats) {
  return REQUIRED_PROPERTIES.every(prop => timeStats[prop] != null);
}
