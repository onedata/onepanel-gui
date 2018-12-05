/**
 * Configuration of space Files Popularity feature
 * Used mainly in space file popularity tab
 *
 * @module components/space-file-popularity
 * @author Jakub Liput
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';

export default Component.extend(I18n, {
  media: inject(),
  globalNotify: inject(),

  i18nPrefix: 'components.spaceFilePopularity',

  /**
   * A function invoked with 
   * @virtual
   * @type {Onepanel.FilePopularityConfiguration}
   */
  filePopularityConfiguration: undefined,

  /**
   * Invoked when changing file popularity options
   * @virtual
   * @type {function}
   */
  configureFilePopularity: notImplementedReject,

  actions: {
    /**
     * @param {object|boolean} data
     * @returns {Promise<any>} response of onepanel server
     */
    configureFilePopularity(data) {
      const configureFilePopularity = this.get('configureFilePopularity');
      let configuration;
      if (typeof data === 'boolean') {
        configuration = { enabled: data };
      } else {
        configuration = data;
      }
      return configureFilePopularity(configuration)
        .catch(error => {
          this.get('globalNotify').backendError(
            this.t('configuringFilePopularity'),
            error
          );
          throw error;
        });
    },
  },
});
