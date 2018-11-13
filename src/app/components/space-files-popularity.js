/**
 * Configuration of space Files Popularity feature
 * Used mainly in space files popularity tab
 *
 * @module components/space-files-popularity
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject } from '@ember/service';

import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';

export default Component.extend({
  globalNotify: inject(),

  /**
   * A function invoked with 
   * @virtual
   * @type {Onepanel.FilesPopularityConfiguration}
   */
  filesPopularityConfiguration: undefined,

  /**
   * Invoked when changing files popularity options (currently on enable/disable)
   * with single argument of type `Onepanel.FilesPopulariry`
   * @virtual
   * @type {function}
   */
  configureFilesPopularity: notImplementedReject,

  actions: {
    /**
     * @param {boolean} enabled
     * @returns {Promise<any>} response of onepanel server
     */
    toggleFilesPopularity(enabled) {
      const configureFilesPopularity = this.get('configureFilesPopularity');

      return configureFilesPopularity({ enabled })
        .catch(error => {
          const errorDesc = (enabled ? 'enabling' : 'disabling') +
            ' files popularity feature';
          this.get('globalNotify').backendError(errorDesc, error);
          // we should reject toggle action
          throw error;
        });
    },
  },
});
