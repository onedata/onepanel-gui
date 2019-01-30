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
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';

export default Component.extend(I18n, {
  onezoneGui: service(),
  guiUtils: service(),
  onepanelConfiguration: service(),
  onepanelServer: service(),

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

  isStandaloneOnepanel: computed('onepanelServer', function isStandaloneOnepanel() {
    return !this.get('onepanelServer').getClusterIdFromUrl();
  }),

  onepanelUrl: computed(function onepanelUrl() {
    if (this.get('isStandaloneOnepanel')) {
      return location.origin;
    } else {
      return this.get('onepanelServer.standaloneOnepanelOrigin');
    }
  }),

  actions: {
    manageNewCluster() {
      return this.get('finish')();
    },
  },
});
