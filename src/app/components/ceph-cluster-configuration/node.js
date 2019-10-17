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
import { observer, computed } from '@ember/object';

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
   * @type {Utils/Ceph/NodeConfiguration}
   */
  node: undefined,

  /**
   * @type {boolean}
   */
  isCephDeployed: true,

  /**
   * True if node configuration can be edited (e.g. is not blocked by any
   * backend process).
   * @type {boolean}
   */
  allowsEdition: false,

  /**
   * @type {Object}
   */
  showFormLayoutConfig: Object.freeze({
    formLabelColumns: 'col-xs-12 col-sm-3 col-md-2',
    formInputColumns: 'col-xs-12 col-sm-9 col-md-10',
  }),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  managerAndMonitorToggleId: computed('elementId', function managerAndMonitorToggleId() {
    return this.get('elementId') + '-manager-and-monitor';
  }),

  isCephDeployedObserver: observer('isCephDeployed', function isCephDeployedObserver() {
    const isCephDeployed = this.get('isCephDeployed');
    // if in create mode
    if (!isCephDeployed) {
      this.set('allowsEdition', true);
    }
  }),

  init() {
    this._super(...arguments);
    this.isCephDeployedObserver();
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
