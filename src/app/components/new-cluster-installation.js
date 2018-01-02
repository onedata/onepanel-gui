/**
 * Cluster init step: installation a.k.a. deployment
 *
 * Invokes passed actions:
 * - clusterConfigurationSuccess()
 * - nextStep() - a next step of cluster init should be presented
 *
 * @module components/new-cluster-installation
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import Onepanel from 'npm:onepanel';
import { invokeAction } from 'ember-invoke-action';
import ClusterHostInfo from 'onepanel-gui/models/cluster-host-info';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import watchTaskStatus from 'ember-onedata-onepanel-server/utils/watch-task-status';

const {
  A,
  assert,
  inject: { service },
  RSVP: { Promise },
  computed,
  computed: { readOnly },
  String: { camelize },
  run: { scheduleOnce },
  on,
  observer,
} = Ember;

const {
  ProviderConfiguration,
  ZoneConfiguration,
  TaskStatus: {
    StatusEnum,
  },
} = Onepanel;

const COOKIE_DEPLOYMENT_TASK_ID = 'deploymentTaskId';

function getClusterHostname(hostnames) {
  return hostnames.objectAt(0);
}

function getDomain(hostname) {
  return hostname.split('.').splice(1).join('.');
}

function getHostname(hostname) {
  return hostname.split('.')[0];
}

function getHostnamesOfType(hosts, type) {
  return hosts.filter(h => h[type]).map(h => h.hostname);
}

function configurationClass(serviceType) {
  return serviceType === 'zone' ? ZoneConfiguration : ProviderConfiguration;
}

export default Ember.Component.extend({
  classNames: ['new-cluster-installation', 'container-fluid'],

  onepanelServer: service(),
  clusterManager: service(),
  globalNotify: service(),
  cookies: service(),

  onepanelServiceType: readOnly('onepanelServer.serviceType'),

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

  deploymentStatusLoading: computed.reads('deploymentStatusProxy.isPending'),

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

  init() {
    this._super(...arguments);

    this.set(
      'hostsProxy',
      PromiseObject.create({
        promise: new Promise((resolve, reject) => {
          let gettingHosts = this.get('clusterManager').getHosts(true);
          gettingHosts.then(hosts => {
            hosts = A(hosts.map(h => ClusterHostInfo.create(h)));
            resolve(hosts);
          });
          gettingHosts.catch(reject);
        }),
      })
    );

    const {
      deploymentTaskId,
      onepanelServiceType,
      onepanelServer,
    } = this.getProperties('deploymentTaskId', 'onepanelServer', 'onepanelServiceType');

    if (onepanelServiceType === 'provider') {
      this.set('_zoneOptionsValid', true);
    }

    if (deploymentTaskId) {
      const task = watchTaskStatus(onepanelServer, deploymentTaskId);
      this.showDeployProgress(task);
      this.watchDeployStatus(task);
    }
  },

  configureFinished() {
    let {
      globalNotify,
      onepanelServiceType,
      _zoneName,
    } = this.getProperties(
      'globalNotify',
      'onepanelServiceType',
      '_zoneName'
    );
    // TODO i18n
    globalNotify.info('Cluster deployed successfully');
    if (onepanelServiceType === 'zone') {
      invokeAction(this, 'changeClusterName', _zoneName);
    }
    invokeAction(this, 'nextStep');
  },

  configureFailed({ taskStatus }) {
    this.get('globalNotify').backendError('cluster deployment', taskStatus.error);
  },

  getNodes() {
    let hosts = this.get('hosts');
    let hostnames = hosts.map(h => h.hostname);
    let nodes = {};
    hostnames.forEach(hn => {
      nodes[hn] = {
        hostname: getHostname(hn),
      };
    });
    return nodes;
  },

  /**
   * Create an object of cluster deployment configuration using onepanel lib
   * @param {string} serviceType one of: provider, zone
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
    let domainName = getDomain(getClusterHostname(hostnames));

    let configProto = {
      cluster: {
        autoDeploy: true,
        domainName,
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
    };

    // in zone mode, add zone name    
    if (serviceType === 'zone') {
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
        'one' + onepanelServiceType,
        camelize(`configure-${onepanelServiceType}`),
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

  changeCanDeploy: on('init', observer('_hostTableValid', '_zoneOptionsValid',
    function () {
      let canDeploy = this.get('_hostTableValid') && this.get('_zoneOptionsValid');
      scheduleOnce('afterRender', this, () => this.set('canDeploy', canDeploy));
    })),

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
      let host = hosts.find(h => h.hostname === hostname);
      assert(
        host,
        'host for which option was changed, must be present in collection'
      );
      host.set(option, value);
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
  },
});
