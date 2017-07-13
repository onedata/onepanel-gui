/**
 * Function to check if TimeStats can be used in chart 
 *
 * @module utils/model-validators/validate-time-stats
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
 * @returns {boolean} true if timeStats record is valid
 */
export default function validateTimeStats(timeStats) {
  return REQUIRED_PROPERTIES.every(prop => timeStats[prop] != null);
}