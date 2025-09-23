/**
 * Shows deployment table - used as a view for nodes aspect of cluster resource
 *
 * @author Jakub Liput
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @copyright (C) 2025 Onedata (onedata.org)
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

import { inject as service } from '@ember/service';
import { computed, defineProperty, set } from '@ember/object';
import { bool, reads } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/i18n';
import clusterIpsConfigurator from 'onepanel-gui/mixins/components/cluster-ips-configurator';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import _ from 'lodash';
import EnableS3Action from 'onepanel-gui/utils/enable-s3-action';
import ClusterHostInfo from 'onepanel-gui/models/cluster-host-info';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import { all as allFulfilled } from 'rsvp';

export default Component.extend(I18n, clusterIpsConfigurator, {
  classNames: ['content-clusters-nodes'],

  onepanelServer: service(),
  deploymentManager: service(),
  providerManager: service(),
  globalNotify: service(),
  guiUtils: service(),

  i18nPrefix: 'components.contentClustersNodes',

  /**
   * Hostname of primary cluster manager
   * @type {string}
   */
  primaryClusterManager: null,

  /**
   * If true, table of IPs is in edition mode
   * @type {boolean}
   */
  ipsEdit: false,

  /**
   * If true, table of services is in edition mode
   * @type {boolean}
   */
  isEditingServices: false,

  /**
   * @type {ClusterDeploymentInfo}
   */
  editedClusterDeploymentInfo: null,

  _ipsFormData: undefined,

  _origIpsFormData: undefined,

  isServicesTableModified: false,

  clusterHostsInfoProxy: undefined,

  /** @type {ClusterHostTableReadonlyServices} */
  readonlyServicesHosts: undefined,

  /**
   * Fulfills when data necessary for displaying services table tab is loaded.
   * @type {PromiseObject}
   */
  servicesTabProxy: undefined,

  /** @type {import('./cluster-host-table').ClusterHostTableMode} */
  servicesTableMode: computed('isEditingServices', function servicesTableMode() {
    return this.isEditingServices ? 'edit' : 'show';
  }),

  /**
   * @type {Ember.ComputedProperty<'onezone'|'oneprovider'>}
   */
  onepanelServiceType: reads('guiUtils.serviceType'),

  /**
   * @override
   * @type {PromiseObject<ProviderDetails>}
   */
  providerDetailsProxy: computed(function providerDetailsProxy() {
    if (this.get('onepanelServiceType') === 'oneprovider') {
      return this.get('providerManager').getProviderDetailsProxy();
    }
  }),

  /** @type {ComputedProperty<Array<Models.ClusterHostInfo>>} */
  servicesTableHosts: computed(
    'isEditingServices',
    'editedClusterDeploymentInfo.clusterHostsInfo',
    'clusterHostsInfoProxy.content.clusterHostsInfo',
    function servicesTableHosts() {
      return this.isEditingServices ?
        this.editedClusterDeploymentInfo.clusterHostsInfo :
        this.clusterHostsInfoProxy.content.clusterHostsInfo;
    }
  ),

  servicesTablePrimaryClusterManager: computed(
    'isEditingServices',
    'editedClusterDeploymentInfo.mainManagerHostname',
    'clusterHostsInfoProxy.content.mainManagerHostname',
    function servicesTablePrimaryClusterManager() {
      return this.isEditingServices ?
        this.editedClusterDeploymentInfo.mainManagerHostname :
        this.clusterHostsInfoProxy.content.mainManagerHostname;
    }
  ),

  servicesCancelEditButtonType: computed(
    'isEditingServices',
    'isServicesTableModified',
    function servicesCancelEditButtonType() {
      return this.isEditingServices && this.isServicesTableModified ?
        'warning' : 'default';
    }
  ),

  servicesCancelEditButtonTitle: computed(
    'isServicesTableModified',
    function servicesCancelEditButtonTitle() {
      return this.t(this.isServicesTableModified ? 'discardChanges' : 'cancelEdit');
    }
  ),

  installationDetailsProxy: reads('deploymentManager.installationDetailsProxy'),

  isEditServicesDisabled: bool('editServicesDisabledTip'),

  editServicesDisabledTip: computed(
    'onepanelServiceType',
    function editServicesDisabledTip() {
      return this.onepanelServiceType === 'onezone' ? this.t('editDisabledZone') : null;
    }
  ),

  /** @type {ComputedProperty<number>} */
  oneS3Port: reads('installationDetailsProxy.content.cluster.oneS3.port'),

  init() {
    this._super(...arguments);
    (async () => {
      await this.initClusterHostsInfoProxy();
      defineProperty(
        this,
        'servicesTabProxy',
        computed(
          'initClusterHostsInfoProxy',
          'installationDetailsProxy',
          function servicesTabProxy() {
            const promise = allFulfilled([
              this.initClusterHostsInfoProxy,
              this.installationDetailsProxy,
            ]);
            return promiseObject(promise);
          }
        )
      );
      this.notifyPropertyChange('servicesTabProxy');
      this.updateReadonlyServicesHosts(null, this.servicesTableMode);
    })();
  },

  /**
   * @override
   */
  _startSetup() {
    return this._super(...arguments).then(() => {
      safeExec(this, 'set', 'ipsEdit', false);
    });
  },

  async initClusterHostsInfoProxy() {
    const promise = this.deploymentManager.getClusterHostsInfo();
    this.set('clusterHostsInfoProxy', promiseObject(promise));
    await promise;
  },

  getModifiedEnabledS3Hosts() {
    const prevHostsInfo = this.clusterHostsInfoProxy.content.clusterHostsInfo;
    const newHostsInfo = this.editedClusterDeploymentInfo.clusterHostsInfo;
    const diffHostsInfo = _.zip(prevHostsInfo, newHostsInfo);
    const newlyEnabledS3Hosts = [];
    for (const [prevHostInfo, newHostInfo] of diffHostsInfo) {
      if (!prevHostInfo.oneS3 && newHostInfo.oneS3) {
        newlyEnabledS3Hosts.push(prevHostInfo.hostname);
      }
    }
    return newlyEnabledS3Hosts;
  },

  async applyServicesChanges() {
    const hostnames = this.getModifiedEnabledS3Hosts();

    const action = EnableS3Action.create({
      ownerSource: this,
      context: {
        hostnames,
      },
    });
    try {
      const result = await action.execute();

      switch (result.status) {
        case 'done':
          await this.initClusterHostsInfoProxy();
          this.endServicesEdit();
          this.reloadHostData();
          break;
        case 'failed':
          await this.initClusterHostsInfoProxy();
          this.updateServicesTableModified();
          this.reloadHostData();
          break;
        case 'cancelled':
        case 'pending':
        default:
          break;
      }
    } finally {
      action.destroy();
    }
  },

  updateServicesTableModified() {
    this.set(
      'isServicesTableModified',
      Boolean(this.getModifiedEnabledS3Hosts().length)
    );
  },

  /**
   *
   * @param {ClusterHostTableMode} currentMode
   * @param {ClusterHostTableMode} newMode
   * @returns {ClusterHostTableReadonlyServices}
   */
  updateReadonlyServicesHosts(currentMode, newMode) {
    if (this.readonlyServicesHosts && currentMode === newMode) {
      return;
    }
    const readonlyServicesHosts = {};
    for (const hostInfo of this.servicesTableHosts) {
      readonlyServicesHosts[hostInfo.hostname] = {
        database: true,
        clusterWorker: true,
        clusterManager: true,
        primaryClusterManager: true,
        oneS3: true,
      };
    }
    if (newMode === 'edit') {
      const isOneS3OnCluster = this.servicesTableHosts.some(hostInfo => hostInfo.oneS3);
      const cannotEnableWorkerOneS3 = isOneS3OnCluster && this.oneS3Port === 443;
      for (const hostInfo of this.servicesTableHosts) {
        if (!hostInfo.oneS3) {
          if (hostInfo.clusterWorker && cannotEnableWorkerOneS3) {
            readonlyServicesHosts[hostInfo.hostname].oneS3 =
              this.t('disabledToggleReasons.workerOneS3PortConflict');
          } else {
            readonlyServicesHosts[hostInfo.hostname].oneS3 = false;
          }
        }
      }
    }
    this.set('readonlyServicesHosts', readonlyServicesHosts);
  },

  startServicesEdit() {
    const clusterHostsInfo = this.clusterHostsInfoProxy.content;
    const editedClusterHostsInfo = clusterHostsInfo.clusterHostsInfo.map(hostInfo => {
      const {
        hostname,
        database,
        clusterWorker,
        clusterManager,
        oneS3,
      } = hostInfo;
      return ClusterHostInfo.create({
        hostname,
        database,
        clusterWorker,
        clusterManager,
        oneS3,
      });
    });
    const editedClusterDeploymentInfo = {
      mainManagerHostname: clusterHostsInfo.mainManagerHostname,
      clusterHostsInfo: editedClusterHostsInfo,
    };
    this.updateReadonlyServicesHosts('show', 'edit');
    this.setProperties({
      isEditingServices: true,
      editedClusterDeploymentInfo,
      isServicesTableModified: false,
    });
  },

  endServicesEdit() {
    this.updateReadonlyServicesHosts('edit', 'show');
    this.setProperties({
      isEditingServices: false,
      editedClusterDeploymentInfo: null,
      isServicesTableModified: false,
    });
  },

  actions: {
    enableIpsEdit() {
      this.setProperties({
        ipsEdit: true,
        _origIpsFormData: _.cloneDeep(this.get('_ipsFormData')),
      });
    },

    cancelIpsEdit() {
      this.setProperties({
        ipsEdit: false,
        _ipsFormData: this.get('_origIpsFormData'),
        _origIpsFormData: undefined,
      });
    },

    startServicesEdit() {
      this.startServicesEdit();
    },

    endServicesEdit() {
      this.endServicesEdit();
    },

    applyServicesChanges() {
      this.applyServicesChanges();
    },

    async hostOptionChanged(hostname, option, value) {
      if (!this.isEditingServices || option !== 'oneS3') {
        return;
      }
      const clusterHostInfo =
        this.editedClusterDeploymentInfo.clusterHostsInfo.find(hostInfo =>
          hostInfo.hostname === hostname
        );
      if (clusterHostInfo) {
        set(clusterHostInfo, 'oneS3', value);
      }
      this.updateServicesTableModified();
    },
  },
});
