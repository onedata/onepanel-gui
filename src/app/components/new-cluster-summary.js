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
import { reads } from '@ember/object/computed';
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

  isEmergencyOnepanel: reads('onepanelServer.isEmergency'),

  onepanelUrl: computed(function onepanelUrl() {
    if (this.get('isEmergencyOnepanel')) {
      return location.origin;
    } else {
      return this.get('onepanelServer.emergencyOnepanelOrigin');
    }
  }),

  actions: {
    manageNewCluster() {
      return this.get('finish')();
    },
  },
});
