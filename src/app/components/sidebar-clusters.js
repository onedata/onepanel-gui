/**
 * A sidebar for clusters (extension of `two-level-sidebar`)
 *
 * @module components/sidebar-clusters
 * @author Jakub Liput
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { inject as service } from '@ember/service';
import SidebarClusters from 'onedata-gui-common/components/sidebar-clusters';
import layout from 'onedata-gui-common/templates/components/two-level-sidebar';

export default SidebarClusters.extend({
  layout,

  classNames: ['sidebar-clusters-onepanel'],

  guiUtils: service(),
  dnsManager: service(),
  guiSettingsManager: service(),

  /**
   * @virtual
   * @type {Array<ClusterDetails>}
   */
  model: undefined,

  /**
   * @override
   */
  secondLevelItemsComponent: 'sidebar-clusters/second-level-items',

  init() {
    this._super(...arguments);
    this.get('dnsManager').getDnsCheckProxy({
      fetchArgs: [{ forceCheck: false }],
    });
    // because of bug in ember observers/computed in service
    this.get('dnsManager.dnsValid');
    this.get('dnsManager.dnsCheckProxy.isRejected');
  },
});
