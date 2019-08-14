/**
 * Shows information about ceph cluster configuration. Allows setup of the cluster.
 * 
 * @module components/ceph-cluster-configuration
 * @author Michał Borzęcki
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { sort } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { next } from '@ember/runloop';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

export default Component.extend(I18n, {
  classNames: ['ceph-cluster-configuration'],

  /**
   * @override
   */
  i18nPrefix: 'components.cephClusterConfiguration',

  /**
   * @type {Ember.ComputedProperty<Utils/Ceph/ClusterConfiguration>}
   */
  config: undefined,

  /**
   * @type {boolean}
   */
  isCephDeployed: true,

  /**
   * @type {Array<string>}
   */
  configNodesSorting: Object.freeze(['host']),

  /**
   * @type {Ember.ComputedProperty<Utils/Ceph/NodeConfiguration>}
   */
  sortedConfigNodes: sort('config.nodes', 'configNodesSorting'),

  init() {
    this._super(...arguments);

    this.get('config.osdIdGenerator.nextIdFromBackendProxy').then(() => {
      next(() => safeExec(this, 'expandNodesInDeployment'));
    });
  },

  /**
   * Expands all nodes if "create" mode is active
   * @returns {undefined}
   */
  expandNodesInDeployment() {
    if (!this.get('isCephDeployed')) {
      this.$('.ceph-node-header').click();
    }
  },
});
