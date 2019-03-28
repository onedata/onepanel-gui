/**
 * Cluster init step: installation a.k.a. deployment
 *
 * Invokes passed actions:
 * - clusterConfigurationSuccess()
 * - nextStep() - a next step of cluster init should be presented
 *
 * @module components/new-cluster-installation
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

import { A } from '@ember/array';
import { assert } from '@ember/debug';
import { inject as service } from '@ember/service';
import { Promise } from 'rsvp';
import { readOnly, reads, sort } from '@ember/object/computed';
import { camelize } from '@ember/string';
import { scheduleOnce, later } from '@ember/runloop';
import { observer, computed, get, set } from '@ember/object';
import Onepanel from 'npm:onepanel';
import ClusterHostInfo from 'onepanel-gui/models/cluster-host-info';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import watchTaskStatus from 'ember-onedata-onepanel-server/utils/watch-task-status';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import shortServiceType from 'onepanel-gui/utils/short-service-type';

const {
  ProviderConfiguration,
  ZoneConfiguration,
  TaskStatus: {
    StatusEnum,
  },
} = Onepanel;

const COOKIE_DEPLOYMENT_TASK_ID = 'deploymentTaskId';

function getHostnamesOfType(hosts, type) {
  return hosts.filter(h => h[type]).map(h => h.hostname);
}

function configurationClass(serviceType) {
  return serviceType === 'onezone' ? ZoneConfiguration : ProviderConfiguration;
}

export default Component.extend(I18n, {
  classNames: ['new-cluster-installation', 'container-fluid'],

  onepanelServer: service(),
  deploymentManager: service(),
  globalNotify: service(),
  cookies: service(),
  i18n: service(),
  guiUtils: service(),

  i18nPrefix: 'components.newClusterInstallation',

  onepanelServiceType: readOnly('guiUtils.serviceType'),

  /**
   * @virtual optional
   * @type {string}
   * If the cluster deployment is in progress on initializing this component,
   * this property should contain ID of server deployment task.
   */
  deploymentTaskId: undefined,

  primaryClusterManager: null,

  /**
   * Resolves with EmberArray of HostInfo.
   * @type {PromiseObject.EmberArray.HostInfo}
   */
  hostsProxy: null,

  hosts: readOnly('hostsProxy.content'),

  /**
   * @type {Array<string>}
   */
  hostsSorting: Object.freeze(['hostname']),

  /**
   * @type {Ember.ComputedProperty<Ember.Array<HostInfo>>}
   */
  hostsSorted: sort('hosts', 'hostsSorting'),

  /**
   * If true, the deploy action can be invoked
   * @type {boolean}
   */
  canDeploy: false,

  /**
   * The promise resolves when we know if we have unfinished deployment.
   * Initiliazed in `init`.
   * @type {PromiseObject}
   */
  deploymentStatusProxy: undefined,

  deploymentStatusLoading: reads('deploymentStatusProxy.isPending'),

  hostsUsed: computed('hosts.@each.isUsed', function () {
    let hosts = this.get('hosts');
    return hosts.filter(h => h.get('isUsed'));
  }).readOnly(),

  _zoneName: '',
  _zoneDomainName: '',

  /**
   * @type {boolean}
   */
  _zoneOptionsValid: false,

  /**
   * @type {boolean}
   */
  _hostTableValid: false,

  /**
   * @type {string}
   */
  _newHostname: '',

  /**
   * @type {boolean}
   */
  _isSubmittingAddress: false,

  /**
   * @type {function}
   */
  nextStep: undefined,

  /**
   * Changed on add new host button click
   * @type {boolean}
   */
  addingNewHost: false,

  /**
   * @type {number}
   */
  newHostExpirationTimeout: 2000,

  /**
   * @type {Ember.A}
   */
  newHosts: undefined,

  /**
   * @type {boolean}
   */
  addMoreInfoVisible: false,

  /**
   * @type {string}
   */
  couchbasePorts: '4369, 8091, 8092, 11207, 11209, 11210, 11211, 18091, 18092, ' +
    '21100 - 21299',

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  clusterPorts: computed('onepanelServiceType', function () {
    const onepanelServiceType = this.get('onepanelServiceType');
    return (onepanelServiceType === 'onezone' ? '52, ' : '') +
      '80, 443, 4369, 9100 - 9139';
  }),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  panelType: computed('onepanelServiceType', function () {
    const {
      i18n,
      onepanelServiceType,
    } = this.getProperties('i18n', 'onepanelServiceType');
    return onepanelServiceType ?
      i18n.t(
        `services.guiUtils.serviceType.${onepanelServiceType}`
      ) : null;
  }),

  addingNewHostChanged: observer('addingNewHost', function () {
    if (!this.get('addingNewHost')) {
      this.set('_newHostname', '');
    }
  }),

  init() {
    this._super(...arguments);

    this.observeResetNewHostname();
    this.changeCanDeploy();
    this.set(
      'hostsProxy',
      PromiseObject.create({
        promise: this.get('deploymentManager').getHosts()
          .then(hosts => A(hosts.map(h => ClusterHostInfo.create(h)))),
      })
    );
    this.set('newHosts', A());

    const {
      deploymentTaskId,
      onepanelServiceType,
      onepanelServer,
    } = this.getProperties('deploymentTaskId', 'onepanelServer', 'onepanelServiceType');

    if (onepanelServiceType === 'oneprovider') {
      this.set('_zoneOptionsValid', true);
    }

    if (deploymentTaskId) {
      const task = watchTaskStatus(onepanelServer, deploymentTaskId);
      this.showDeployProgress(task);
      this.watchDeployStatus(task);
    }
  },

  configureFinished() {
    const {
      globalNotify,
      nextStep,
    } = this.getProperties(
      'globalNotify',
      'nextStep',
    );
    // TODO i18n
    globalNotify.info('Cluster deployed successfully');
    nextStep();
  },

  configureFailed({ taskStatus }) {
    this.get('globalNotify').backendError('cluster deployment', taskStatus.error);
  },

  getNodes() {
    let hosts = this.get('hosts');
    let hostnames = hosts.map(h => get(h, 'hostname'));
    let nodes = {};
    hostnames.forEach(hostname => {
      nodes[hostname] = { hostname };
    });
    return nodes;
  },

  /**
   * Create an object of cluster deployment configuration using onepanel lib
   * @param {string} serviceType one of: oneprovider, onezone
   * @return {Onepanel.ProviderConfiguration|Onepanel.ZoneConfiguration}
   */
  createConfiguration(serviceType) {
    let {
      hostsUsed,
      primaryClusterManager,
      _zoneName,
      _zoneDomainName,
    } = this.getProperties(
      'hostsUsed',
      'primaryClusterManager',
      '_zoneName',
      '_zoneDomainName'
    );

    const ConfigurationClass = configurationClass(serviceType);

    let nodes = this.getNodes();
    let hostnames = hostsUsed.map(h => h.hostname);
    if (!hostnames || hostnames.length === 0) {
      throw new Error(
        'Cannot create cluster configuration if no hosts are selected');
    }

    let configProto = {
      cluster: {
        autoDeploy: true,
        domainName: '',
        nodes,
        managers: {
          mainNode: primaryClusterManager,
          nodes: getHostnamesOfType(hostsUsed, 'clusterManager'),
        },
        workers: {
          nodes: getHostnamesOfType(hostsUsed, 'clusterWorker'),
        },
        databases: {
          nodes: getHostnamesOfType(hostsUsed, 'database'),
        },
      },
      onepanel: {
        interactiveDeployment: true,
        users: [],
      },
    };

    // in zone mode, add zone name    
    if (serviceType === 'onezone') {
      configProto.onezone = {
        name: _zoneName,
        domainName: _zoneDomainName,
      };
    }

    let configuration = ConfigurationClass.constructFromObject(configProto);

    return configuration;
  },

  /**
   * Save deployment server task ID in case if page will be refreshed
   * @param {string} taskId
   */
  storeDeploymentTask(taskId) {
    assert(
      'component:new-cluster-installation: tried to store empty taskId',
      taskId
    );
    this.get('cookies').write(COOKIE_DEPLOYMENT_TASK_ID, taskId);
  },

  /**
   * Clear stored last deployment task ID (deployment task has finished)
   */
  clearDeploymentTask() {
    this.get('cookies').clear(COOKIE_DEPLOYMENT_TASK_ID);
  },

  /**
   * Makes a backend call to start cluster deployment and watches deployment process.
   * Returned promise resolves when deployment started (NOTE: not when it finishes).
   * The promise resolves with a onepanelServer.request resolve result
   * (contains task property with jq.Promise of deployment task).
   * @return {Promise}
   */
  _startDeploy() {
    return new Promise((resolve, reject) => {
      let {
        onepanelServer,
        onepanelServiceType,
      } = this.getProperties('onepanelServer', 'onepanelServiceType');
      let providerConfiguration = this.createConfiguration(onepanelServiceType);
      onepanelServer.request(
        onepanelServiceType,
        camelize(`configure-${shortServiceType(onepanelServiceType)}`),
        providerConfiguration
      ).then(resolve, reject);
    });
  },

  /**
   * Show progress of deployment using deployment task promise.
   * @param {jQuery.Promise} deployment
   * @returns {undefined}
   */
  showDeployProgress(deployment) {
    this.set('deploymentPromise', deployment);
  },

  hideDeployProgress() {
    this.set('deploymentPromise', null);
  },

  /**
   * Bind on events of deployment task. 
   * @param {jQuery.Promise} task
   * @returns {undefined}
   */
  watchDeployStatus(task) {
    task.done(taskStatus => {
      this.clearDeploymentTask();
      if (taskStatus.status === StatusEnum.ok) {
        this.configureFinished(taskStatus);
      } else {
        this.configureFailed({ taskStatus });
      }
    });
    task.fail(error => this.configureFailed({ error }));
    task.always(() => this.hideDeployProgress());
  },

  changeCanDeploy: observer('_hostTableValid', '_zoneOptionsValid',
    function () {
      let canDeploy = this.get('_hostTableValid') && this.get('_zoneOptionsValid');
      scheduleOnce('afterRender', this, () => this.set('canDeploy', canDeploy));
    }),

  observeResetNewHostname: observer('addingNewHost', function () {
    if (this.get('addingNewHost')) {
      scheduleOnce('afterRender', () => this.$('.input-add-host')[0].focus());
    } else {
      this.set('_newHostname', '');
    }
  }),

  /**
   * Temporary adds host to newHosts array
   * @param {ClusterHostInfo} host 
   */
  markHostAsNew(host) {
    const {
      newHosts,
      newHostExpirationTimeout,
    } = this.getProperties('newHosts', 'newHostExpirationTimeout');
    newHosts.pushObject(host);
    later(
      this,
      () => safeExec(newHosts, 'removeObject', host),
      newHostExpirationTimeout
    );
  },

  actions: {
    zoneFormChanged(fieldName, value) {
      switch (fieldName) {
        case 'main.name':
          this.set('_zoneName', value);
          break;
        case 'main.domainName':
          this.set('_zoneDomainName', value);
          break;
        default:
          throw 'Unexpected field changed in zone installation form: ' + fieldName;
      }
    },

    hostOptionChanged(hostname, option, value) {
      let hosts = this.get('hosts');
      let host = hosts.find(h => get(h, 'hostname') === hostname);
      assert(
        host,
        'host for which option was changed, must be present in collection'
      );
      set(host, option, value);
    },

    primaryClusterManagerChanged(hostname) {
      this.set('primaryClusterManager', hostname);
    },

    /**
     * Handle new validation state of user options in hosts table. 
     *
     * @param {boolean} isValid
     * @returns {undefined}
     */
    hostTableValidChanged(isValid) {
      this.set('_hostTableValid', isValid);
    },

    zoneOptionsValidChanged(isValid) {
      this.set('_zoneOptionsValid', isValid);
    },

    /**
     * Start deployment process.
     *
     * When process starts successfully, a deployment promise
     * is bound to success/failure handlers and a deploy process is shown.
     * 
     * Returned promise resolves when backend started deployment.
     * 
     * @return {Promise}
     */
    startDeploy() {
      if (this.get('canDeploy') !== true) {
        return new Promise((_, reject) => reject());
      }

      let start = this._startDeploy();
      start.then(({ task }) => {
        this.storeDeploymentTask(task.taskId);
        this.showDeployProgress(task);
        this.watchDeployStatus(task);
      });
      start.catch(error => {
        this.get('globalNotify').backendError('deployment start', error);
      });
      return start;
    },

    submitNewHost() {
      if (!this.get('_newHostname')) {
        return Promise.reject();
      } else {
        const _newHostname = this.get('_newHostname');
        this.set('_isSubmittingNewHost', true);
        return this.get('deploymentManager').addKnownHost(_newHostname)
          .then(knownHost => {
            const newHost = ClusterHostInfo.create(knownHost);
            this.get('hosts').pushObject(newHost);
            this.markHostAsNew(newHost);
          })
          .then(() => safeExec(this, 'setProperties', {
            addingNewHost: false,
            addMoreInfoVisible: false,
          }))
          .catch(error =>
            this.get('globalNotify').backendError(this.tt('addingNewHost'), error)
          )
          .finally(() => safeExec(this, 'set', '_isSubmittingNewHost', false));
      }
    },

    removeHost(hostname) {
      const {
        onepanelServer,
        globalNotify,
        hosts,
      } = this.getProperties('onepanelServer', 'globalNotify', 'hosts');

      return onepanelServer
        .request('onepanel', 'removeClusterHost', hostname)
        .then(() => {
          hosts.removeObject(hosts.find(h => get(h, 'hostname') === hostname));
          if (this.get('primaryClusterManager') === hostname) {
            safeExec(this, 'set', 'primaryClusterManager', undefined);
          }
        })
        .catch(error => {
          globalNotify.backendError(this.t('removingHost'), error);
          throw error;
        });
    },
  },
});
