/**
 * Show information about single node in ceph cluster.
 * 
 * @module components/ceph-cluster-configuration/node
 * @author Michał Borzęcki
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { observer } from '@ember/object';

export default Component.extend(I18n, {
  tagName: '',

  /**
   * @override
   */
  i18nPrefix: 'components.cephClusterConfiguration.node',

  /**
   * @virtual
   * @type {Components/OneCollapsibleList}
   */
  listComponent: undefined,

  /**
   * @virtual
   * @type {Utils/Ceph/CephNodeConfiguration}
   */
  node: undefined,

  /**
   * @type {boolean}
   */
  isStandalone: true,

  /**
   * @type {boolean}
   */
  allowsEdition: false,

  isStandaloneObserver: observer('isStandalone', function isStandaloneObserver() {
    const isStandalone = this.get('isStandalone');
    // if in create mode
    if (!isStandalone) {
      this.set('allowsEdition', true);
    }
  }),

  init() {
    this._super(...arguments);
    this.isStandaloneObserver();
  },

  actions: {
    addOsd() {
      this.get('node').addOsd();
    },
    removeOsd(id) {
      this.get('node').removeOsd(id);
    },
    toggleManagerMonitor() {
      this.toggleProperty('node.managerMonitor.isEnabled');
    },
  },
});
