/**
 * Validate SpaceDetailsAutoCleaningReports data
 *
 * @module utils/response-validators/oneprovider/get-provider-space-auto-cleaning-reports
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import moment from 'moment';

/**
 * @function
 * @param {object} data response data
 * @param {Array} data.reportEntries
 * @returns {boolean} true if response data is valid
 */
export default function (data) {
  try {
    return Array.isArray(data.reportEntries) &&
      data.reportEntries.every(validateReport);
  } catch (error) {
    if (error instanceof TypeError) {
      return false;
    } else {
      throw error;
    }
  }
}

/**
 * @param {Onepanel.SpaceAutoCleaningReport} report
 * @returns {boolean} true if valid
 */
function validateReport(report) {
  return moment(report.startedAt).isValid() &&
    typeof report.releasedBytes === 'number' &&
    typeof report.bytesToRelease === 'number' &&
    typeof report.filesNumber === 'number';
}
