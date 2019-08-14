/**
 * Shows information about ceph cluster configuration. Allows setup of the cluster.
 * 
 * @module components/ceph-cluster-configuration
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
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
   * One of: standalone, create
   * @type {string}
   */
  mode: 'standalone',

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isStandalone: computed('mode', function isStandalone() {
    return this.get('mode') !== 'create';
  }),

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
      next(() => safeExec(this, 'expandNodesInCreateMode'));
    });
  },

  /**
   * Expands all nodes if "create" mode is active
   * @returns {undefined}
   */
  expandNodesInCreateMode() {
    if (this.get('mode') === 'create') {
      this.$('.ceph-node-header').click();
    }
  },
});
