/**
 * A sidebar for clusters (extension of ``two-level-sidebar``)
 *
 * @module components/sidebar-clusters
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { readOnly } from '@ember/object/computed';

import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import TwoLevelSidebar from 'onedata-gui-common/components/two-level-sidebar';
import layout from 'onedata-gui-common/templates/components/two-level-sidebar';

export default TwoLevelSidebar.extend({
  layout,

  classNames: ['sidebar-clusters'],

  onepanelServer: service(),
  onepanelServiceType: readOnly('onepanelServer.serviceType'),

  // TODO this will not work in generic multi-clusters menu  
  cluster: readOnly('model.collection.list.firstObject'),

  firstLevelItemIcon: 'menu-clusters',

  triggerEventOnPrimaryItemSelection: computed('cluster.isInitialized',
    'onepanelServiceType',
    function () {
      let {
        cluster,
        onepanelServiceType,
      } = this.getProperties('cluster', 'onepanelServiceType');
      return !cluster.get('isInitialized') || onepanelServiceType === 'zone';
    }),

  /**
   * @implements TwoLevelSidebar
   */
  sidebarType: 'clusters',

  secondLevelItems: computed('onepanelServiceType', 'cluster.isInitialized', function () {
    let {
      onepanelServiceType,
      cluster,
    } = this.getProperties('onepanelServiceType', 'cluster');
    if (onepanelServiceType === 'provider' && cluster.get('isInitialized')) {
      // TODO i18n
      return [{
          id: 'nodes',
          label: 'Nodes',
          icon: 'node',
        },
        {
          id: 'provider',
          label: 'Provider',
          icon: 'provider',
        },
        {
          id: 'storages',
          label: 'Storages',
          icon: 'support',
        },
        {
          id: 'spaces',
          label: 'Spaces',
          icon: 'space',
        },
      ];
    } else {
      return [];
    }
  }).readOnly(),
});
