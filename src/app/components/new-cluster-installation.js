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
    StatusEnum
  }
} = Onepanel;

const ObjectPromiseProxy = Ember.ObjectProxy.extend(Ember.PromiseProxyMixin);

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

  onepanelServiceType: readOnly('onepanelServer.serviceType'),

  primaryClusterManager: null,

  /**
   * Resolves with EmberArray of HostInfo.
   * @type {ObjectPromiseProxy.EmberArray.HostInfo}
   */
  hostsProxy: null,

  hosts: readOnly('hostsProxy.content'),

  /**
   * If true, the deploy action can be invoked
   * @type {boolean}
   */
  canDeploy: false,

  hostsUsed: computed('hosts.@each.isUsed', function () {
    let hosts = this.get('hosts');
    return hosts.filter(h => h.get('isUsed'));
  }).readOnly(),

  _zoneName: '',

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
      ObjectPromiseProxy.create({
        promise: new Promise((resolve, reject) => {
          let gettingHosts = this.get('clusterManager').getHosts(true);
          gettingHosts.then(hosts => {
            hosts = A(hosts.map(h => ClusterHostInfo.create(h)));
            resolve(hosts);
          });
          gettingHosts.catch(reject);
        })
      })
    );

    if (this.get('onepanelServiceType') === 'provider') {
      this.set('_zoneOptionsValid', true);
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
    this.get('globalNotify').error(
      'Deployment cannot complete because of error: ' +
      taskStatus.error
    );
  },

  getNodes() {
    let hosts = this.get('hosts');
    let hostnames = hosts.map(h => h.hostname);
    let nodes = {};
    hostnames.forEach(hn => {
      nodes[hn] = {
        hostname: getHostname(hn)
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
    } = this.getProperties(
      'hostsUsed',
      'primaryClusterManager',
      '_zoneName'
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
          nodes: getHostnamesOfType(hostsUsed, 'database')
        }
      }
    };

    // in zone mode, add zone name    
    if (serviceType === 'zone') {
      configProto.onezone = {
        name: _zoneName,
      };
    }

    let configuration = ConfigurationClass.constructFromObject(configProto);

    return configuration;
  },

  /**
   * Makes a backend call to start cluster deployment and watches deployment process.
   * Returned promise resolves when deployment started (NOTE: not when it finishes).
   * The promise resolves with a jq.Promise of deployment task.
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
   */
  watchDeployStatus(task) {
    task.done(taskStatus => {
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
      if (fieldName === 'name') {
        this.set('_zoneName', value);
      } else {
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
      start.then(({ data, task }) => {
        this.showDeployProgress(task);
        this.watchDeployStatus(task);
      });
      start.catch((error) => {
        // TODO better error handling - get error type etc.
        this.get('globalNotify').error(
          'Deployment cannot start because of server error: ' + error
        );
      });
      return start;
    },
  }
});