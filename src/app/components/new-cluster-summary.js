/**
 * Finish deployment screen
 * 
 * @module components/new-cluster-summary
 * @author Jakub Liput
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';

export default Component.extend(I18n, {
  i18nPrefix: 'components.newClusterSummary',

  /**
   * @virtual
   * @type {string}
   */
  clusterId: null,

  /**
   * @virtual
   * @type {Function}
   */
  finish: notImplementedIgnore,

  actions: {
    manageNewCluster() {
      return this.get('finish')();
    },
  },
});
