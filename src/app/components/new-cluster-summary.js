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

  // FIXME: fake
  isStandaloneOnepanel: true,

  clusterInOnezoneUrl: computed(function () {
    const clusterId = this.get('onepanelConfiguration.clusterId');
    return this.get('onezoneGui').getOnepanelNavUrlInOnezone({
      clusterId,
      internalRoute: `/clusters/${clusterId}`,
    });
  }),

  onezoneUrl: computed(function onezoneUrl() {
    return 'https://dev-onezone.default.svc.cluster.local';
  }),

  onepanelUrl: computed(function onepanelUrl() {
    if (this.get('guiUtils.serviceType') === 'oneprovider') {
      return 'https://dev-oneprovider-krakow.default.svc.cluster.local:9443';
    } else {
      return 'https://dev-onezone.default.svc.cluster.local:9443';
    }

    // FIXME: to implement
    // if (this.get('isStandaloneOnepanel')) {
    //   return location.origin;
    // } else {

    // }
  }),

  actions: {
    manageNewCluster() {
      return this.get('finish')();
    },
  },
});
