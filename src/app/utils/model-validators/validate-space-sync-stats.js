/**
 * Function to check if SyncStats object from backend is valid for displaying
 *
 * @module utils/model-validators/validate-space-sync-stats
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @export
 * @param {onepanel.SpaceSyncStats} syncStats
 * @returns {boolean} true if SpaceSyncStats object can be consumed by frontend
 */
export default function validateSpaceSyncStats(syncStats) {
  return syncStats != null && syncStats.stats instanceof Object;
}
