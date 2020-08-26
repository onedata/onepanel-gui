/**
 * Function to check if ImportStats object from backend is valid for displaying
 *
 * @module utils/model-validators/validate-storage-import-stats
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @export
 * @param {onepanel.AutoStorageImportStats} importStats
 * @returns {boolean} true if AutoStorageImportStats object can be consumed by frontend
 */
export default function validateStorageImportStats(importStats) {
  return importStats != null && importStats.stats instanceof Object;
}
