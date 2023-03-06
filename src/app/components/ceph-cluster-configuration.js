/**
 * Shows information about ceph cluster configuration. Allows setup of the cluster.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { sort } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { next } from '@ember/runloop';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import $ from 'jquery';

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

    next(() => safeExec(this, 'expandNodesInDeployment'));
  },

  /**
   * Expands all nodes if "create" mode is active
   * @returns {undefined}
   */
  expandNodesInDeployment() {
    const {
      isCephDeployed,
      element,
    } = this.getProperties('isCephDeployed', 'element');

    if (!isCephDeployed) {
      $(element).find('.ceph-node-header').click();
    }
  },
});
