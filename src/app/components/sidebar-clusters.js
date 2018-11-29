/**
 * A sidebar for clusters (extension of `two-level-sidebar`)
 *
 * @module components/sidebar-clusters
 * @author Jakub Liput
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import SidebarClusters from 'onedata-gui-common/components/sidebar-clusters';
import layout from 'onedata-gui-common/templates/components/two-level-sidebar';

export default SidebarClusters.extend({
  layout,

  classNames: ['sidebar-clusters-onepanel'],

  onepanelServer: service(),
  dnsManager: service(),

  // FIXME: to remove
  onepanelServiceType: reads('onepanelServer.serviceType'),

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
