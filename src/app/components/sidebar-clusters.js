/**
 * A sidebar for clusters (extension of `two-level-sidebar`)
 *
 * @module components/sidebar-clusters
 * @author Jakub Liput
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { reads } from '@ember/object/computed';
import { computed, get } from '@ember/object';
import { inject as service } from '@ember/service';
import TwoLevelSidebar from 'onedata-gui-common/components/two-level-sidebar';
import layout from 'onedata-gui-common/templates/components/two-level-sidebar';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default TwoLevelSidebar.extend(I18n, {
  layout,

  classNames: ['sidebar-clusters'],

  i18nPrefix: 'components.sidebarClusters',

  onepanelServer: service(),
  dnsManager: service(),
  i18n: service(),

  onepanelServiceType: reads('onepanelServer.serviceType'),

  // TODO this will not work in generic multi-clusters menu  
  cluster: reads('model.collection.list.firstObject'),

  firstLevelItemIcon: 'menu-clusters',

  /**
   * @implements TwoLevelSidebar
   */
  sidebarType: 'clusters',

  dnsValid: computed(
    'dnsManager.{dnsValid,dnsCheckProxy.isRejected}',
    function dnsValid() {
      return this.get('dnsManager.dnsValid') !== false &&
        !this.get('dnsManager.dnsCheckProxy.isRejected');
    }
  ),

  overviewItem: computed(function overviewItem() {
    return {
      id: 'overview',
      label: this.t('menuItems.overview'),
      icon: 'overview',
    };
  }),

  dnsItem: computed('dnsValid', function dnsItem() {
    return {
      id: 'dns',
      label: this.t('menuItems.dns'),
      icon: 'globe-cursor',
      warningMessage: this.get('dnsValid') === false ?
        this.t('dnsWarning') : undefined,
    };
  }),

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

  secondLevelItems: computed(
    'onepanelServiceType',
    'dnsItem',
    'certificateItem',
    'nodesItem',
    'overviewItem',
    'cluster.isInitialized',
    function () {
      const {
        onepanelServiceType,
        cluster,
        dnsItem,
        certificateItem,
        nodesItem,
        overviewItem,
      } = this.getProperties(
        'onepanelServiceType',
        'cluster',
        'dnsItem',
        'certificateItem',
        'nodesItem',
        'overviewItem',
      );
      if (get(cluster, 'isInitialized')) {
        switch (onepanelServiceType) {
          case 'provider':
            return [
              overviewItem,
              nodesItem,
              dnsItem,
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
              overviewItem,
              nodesItem,
              dnsItem,
              certificateItem,
            ];
          default:
            return [];
        }
      }
    }
  ),

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
