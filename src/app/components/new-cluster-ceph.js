/**
 * Deployment step that allows ceph cluster configuration.
 * 
 * @module components/new-cluster-ceph
 * @author Michał Borzecki
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { get, set, observer } from '@ember/object';
import { alias } from '@ember/object/computed';
import notImplementedThrow from 'onedata-gui-common/utils/not-implemented-throw';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import CephClusterConfiguration from 'onepanel-gui/utils/ceph/cluster-configuration';
import { getOwner } from '@ember/application';
import _ from 'lodash';

export default Component.extend(I18n, {
  classNames: ['new-cluster-ceph'],

  /**
   * @override
   */
  i18nPrefix: 'components.newClusterCeph',

  /**
   * @virtual
   * @type {function}
   */
  nextStep: notImplementedThrow,

  /**
   * @virtual
   * @type {function}
   */
  prevStep: notImplementedThrow,

  /**
   * @virtual
   * @type {Utils/NewClusterDeployProcess}
   */
  stepData: undefined,

  /**
   * @type {Ember.ComputedProperty<Utils/NewClusterDeployProcess>}
   */
  clusterDeployProcess: alias('stepData'),

  /**
   * @type {Ember.ComputedProperty<Utils/Ceph/ClusterConfiguration>}
   */
  cephConfig: undefined,

  cephConfigModifier: observer(
    'clusterDeployProcess.{cephNodes,configuration.ceph}',
    function cephConfigModifier() {
      const clusterDeployProcess = this.get('clusterDeployProcess');
      const rawConfig = get(clusterDeployProcess, 'configuration.ceph');
      const cephNodes = get(clusterDeployProcess, 'cephNodes');
      const cephConfig = this.get('cephConfig') || CephClusterConfiguration.create(
        getOwner(this).ownerInjection()
      );
      if (rawConfig) {
        cephConfig.fillIn(rawConfig);
      }
      const nodesInConfig = get(cephConfig, 'nodes').mapBy('host');
      // Remove nodes, that was removed from ceph cluster
      _.difference(nodesInConfig, cephNodes)
        .forEach(node => cephConfig.removeNodeByHost(node));
      // Add nodes, that was added to ceph cluster
      _.difference(cephNodes, nodesInConfig)
        .forEach(node => cephConfig.addNode(node));
      this.set('cephConfig', cephConfig);
    }
  ),

  init() {
    this._super(...arguments);
    this.cephConfigModifier();
    this.set('clusterDeployProcess.onFinish', () => this.get('nextStep')());
  },

  willDestroyElement() {
    try {
      this.set('clusterDeployProcess.onFinish', notImplementedIgnore);
    } finally {
      this._super(...arguments);
    }
  },

  actions: {
    prevStep() {
      const {
        prevStep,
        clusterDeployProcess,
        cephConfig,
      } = this.getProperties('prevStep', 'clusterDeployProcess', 'cephConfig');
      set(clusterDeployProcess, 'configuration.ceph', cephConfig.toRawConfig());
      prevStep(clusterDeployProcess);
    },
    startDeploy() {
      const cephConfig = this.get('cephConfig').toRawConfig();
      const clusterDeployProcess = this.get('clusterDeployProcess');
      set(clusterDeployProcess, 'configuration.ceph', cephConfig);
      return this.get('clusterDeployProcess').startDeploy();
    },
  },
});
