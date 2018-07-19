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
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default TwoLevelSidebar.extend(I18n, {
  layout,

  classNames: ['sidebar-clusters'],

  i18nPrefix: 'components.sidebarClusters',

  onepanelServer: service(),
  onepanelServiceType: readOnly('onepanelServer.serviceType'),

  // TODO this will not work in generic multi-clusters menu  
  cluster: readOnly('model.collection.list.firstObject'),

  firstLevelItemIcon: 'menu-clusters',

  /**
   * @implements TwoLevelSidebar
   */
  sidebarType: 'clusters',

  certificateItem: computed(function certificateItem() {
    return {
      id: 'certificate',
      label: this.t('menuItems.certificate'),
      icon: 'certificate',
    };
  }),

  nodesItem: computed(function nodesItem() {
    return {
      id: 'nodes',
      label: this.t('menuItems.nodes'),
      icon: 'node',
    };
  }),

  secondLevelItems: computed('onepanelServiceType', 'cluster.isInitialized', function () {
    let {
      onepanelServiceType,
      cluster,
      certificateItem,
      nodesItem,
    } = this.getProperties(
      'onepanelServiceType',
      'cluster',
      'certificateItem',
      'nodesItem'
    );
    if (cluster.get('isInitialized')) {
      switch (onepanelServiceType) {
        case 'provider':
          return [
            nodesItem,
            certificateItem,
            {
              id: 'provider',
              label: this.t('menuItems.provider'),
              icon: 'provider',
            },
            {
              id: 'storages',
              label: this.t('menuItems.storages'),
              icon: 'support',
            },
            {
              id: 'spaces',
              label: this.t('menuItems.spaces'),
              icon: 'space',
            },
          ];
        case 'zone':
          return [
            nodesItem,
            certificateItem,
          ];
        default:
          return [];
      }
    }
  }).readOnly(),
});
