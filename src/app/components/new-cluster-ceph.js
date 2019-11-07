/**
 * Deployment step that allows ceph cluster configuration.
 * 
 * @module components/new-cluster-ceph
 * @author Michał Borzęcki
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { get, set, observer, computed, getProperties } from '@ember/object';
import { reads } from '@ember/object/computed';
import notImplementedThrow from 'onedata-gui-common/utils/not-implemented-throw';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import CephClusterConfiguration from 'onepanel-gui/utils/ceph/cluster-configuration';
import { getOwner } from '@ember/application';
import _ from 'lodash';
import { inject as service } from '@ember/service';
import { resolve } from 'rsvp';

export default Component.extend(I18n, {
  classNames: ['new-cluster-ceph'],

  i18n: service(),

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
   * @type {Object}
   */
  stepData: undefined,

  /**
   * @type {Ember.ComputedProperty<Utils/NewClusterDeployProcess>}
   */
  clusterDeployProcess: reads('stepData.clusterDeployProcess'),

  /**
   * @type {Ember.ComputedProperty<Utils/Ceph/ClusterConfiguration>}
   */
  cephConfig: undefined,

  /**
   * @type {boolean}
   */
  warnAboutBlockDevicesVisible: false,

  /**
   * Mapping cephNodeHost: string -> arrayOfBlockDevices: Array<Utils/Ceph/NodeDevice>.
   * If some host has block device osds, then devices assigned to those osds will
   * be listed in arrayOfBlockDevices.
   * @type {Object}
   */
  usedBlockDevices: computed(
    'cephConfig.nodes.@each.usedDevices',
    function usedBlockDevices() {
      const nodes = this.get('cephConfig.nodes');
      const usedDevices = {};

      nodes.forEach(node => {
        const {
          usedDevices: usedNodeDevicesMapping,
          devicesProxy: nodeDevices,
          host: nodeHost,
        } = getProperties(node, 'usedDevices', 'devicesProxy', 'host');

        const allNodeDevicesIds = Object.keys(usedNodeDevicesMapping);
        const usedNodeDevicesIds =
          allNodeDevicesIds.filter(id => usedNodeDevicesMapping[id] > 0);
        const usedNodeDevices = nodeDevices
          .filter(dev => usedNodeDevicesIds.includes(get(dev, 'id')));

        if (get(usedNodeDevices, 'length')) {
          usedDevices[nodeHost] = usedNodeDevices;
        }
      });

      return usedDevices;
    }
  ),

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

  dumpCephConfigToDeployProcess() {
    const {
      clusterDeployProcess,
      cephConfig,
    } = this.getProperties('clusterDeployProcess', 'cephConfig');
    set(clusterDeployProcess, 'configuration.ceph', cephConfig.toRawConfig());
  },

  closeBlockDevicesWarn() {
    this.set('warnAboutBlockDevicesVisible', false);
  },

  actions: {
    prevStep() {
      const {
        prevStep,
        clusterDeployProcess,
      } = this.getProperties('prevStep', 'clusterDeployProcess');

      this.dumpCephConfigToDeployProcess();
      prevStep({ clusterDeployProcess });
    },
    checkBlockDevicesAndStartDeploy() {
      if (get(Object.keys(this.get('usedBlockDevices')), 'length') > 0) {
        this.set('warnAboutBlockDevicesVisible', true);
        return resolve();
      } else {
        return this.send('startDeploy');
      }
    },
    closeBlockDevicesWarn() {
      this.closeBlockDevicesWarn();
    },
    startDeploy() {
      this.dumpCephConfigToDeployProcess();
      return this.get('clusterDeployProcess').startDeploy().finally(() => {
        this.closeBlockDevicesWarn();
      });
    },
  },
});
