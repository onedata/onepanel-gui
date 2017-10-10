import Component from '@ember/component';
import { inject } from '@ember/service';

export default Component.extend({
  globalNotify: inject(),

  /**
   * @virtual
   * @type {Onepanel.FilesPopularity}
   */
  filesPopularity: undefined,

  /**
   * @virtual
   * @type {function}
   */
  updateFilesPopularity: undefined,

  actions: {
    /**
     * @param {boolean} enabled
     * @returns {Promise<any>} response of onepanel server
     */
    toggleFilesPopularity(enabled) {
      const updateFilesPopularity = this.get('updateFilesPopularity');

      return updateFilesPopularity({ enabled })
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
