import Component from '@ember/component';
import { inject } from '@ember/service';

export default Component.extend({
  spaceManager: inject(),
  globalNotify: inject(),

  /**
   * @virtual
   * @type {string}
   */
  spaceId: undefined,

  /**
   * @virtual
   * @type {Onepanel.FilesPopularity}
   */
  filesPopularity: undefined,

  actions: {
    /**
     * @param {boolean} enabled
     * @returns {Promise<any>} response of onepanel server
     */
    toggleFilesPopularity(enabled) {
      const {
        spaceManager,
        spaceId,
      } = this.getProperties('spaceManager', 'spaceId');

      return spaceManager
        .configureSpaceFilesPopularity(spaceId, enabled)
        .then(filesPopularity =>
          this.get('updateFilesPopularity')(filesPopularity)
        )
        .catch(error => {
          const errorDesc = (enabled ? 'enabling' : 'disabling') +
            ' files popularity feature';
          this.get('globalNotify').backendError(errorDesc, error);
          throw error;
        });
    },
  },
});
