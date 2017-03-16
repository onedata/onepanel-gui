import Ember from 'ember';
import Onepanel from 'npm:onepanel';

const {
  assert,
  inject: {
    service
  },
  RSVP: {
    Promise
  },
  computed: {
    readOnly
  },
  A,
} = Ember;

const {
  ProviderConfiguration,
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

/**
 * @typedef {EmberObject} HostInfo
 * @property {computed.string} hostname
 * @property {computed.boolean} database true if host will run database
 * @property {computed.boolean} clusterWorker true if host will run cluster worker
 * @property {computed.boolean} clusterManager true if host will run cluster manager
 */
const HostInfo = Ember.Object.extend({
  hostname: null,

  // roles
  database: false,
  clusterWorker: false,
  clusterManager: false,
});

export default Ember.Component.extend({
  classNames: ['new-cluster-installation', 'container-fluid'],

  onepanelServer: service(),
  clusterManager: service(),

  primaryClusterManager: null,

  /**
   * Resolves with EmberArray of HostInfo.
   *
   * @type {ObjectPromiseProxy}
   */
  hostsProxy: null,

  /**
   * @type {EmberArray.HostInfo}
   */
  hosts: readOnly('hostsProxy.content'),

  init() {
    this._super(...arguments);
    this.set(
      'hostsProxy',
      ObjectPromiseProxy.create({
        promise: new Promise((resolve, reject) => {
          let gettingHosts = this.get('clusterManager').getHosts();
          gettingHosts.then(hosts => {
            hosts = A(hosts.map(h => HostInfo.create(h)));
            resolve(hosts);
          });
          gettingHosts.catch(reject);
        })
      })
    );
  },

  configureProviderFinished() {
    let id = 'only_cluster';

    let creatingCluster = this.get('clusterManager').createCluster({
      id,
      label: 'Cluster'
    });

    creatingCluster.then(cluster => {
      this.sendAction('clusterCreated', cluster);
      this.sendAction('nextStep');
    });
  },

  configureProviderFailed({
    error,
    taskStatus
  }) {
    if (error) {
      console.error(
        `Configure provider failed (${error.response.statusCode}): ${error.response.text}`
      );
    } else if (taskStatus) {
      console.error(
        `Configure provider failed: ${JSON.stringify(taskStatus)}`);
    }
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
   * @return {Onepanel.ProviderConfiguration}
   */
  createProviderConfiguration() {
    let {
      hosts,
      primaryClusterManager
    } = this.getProperties(
      'hosts',
      'primaryClusterManager'
    );

    let nodes = this.getNodes();
    let hostnames = hosts.map(h => h.hostname);
    let domainName = getDomain(getClusterHostname(hostnames));

    let providerConfiguration = ProviderConfiguration.constructFromObject({
      cluster: {
        domainName,
        autoDeploy: true,
        nodes,
        managers: {
          mainNode: primaryClusterManager,
          nodes: getHostnamesOfType(hosts, 'clusterManager'),
        },
        workers: {
          nodes: getHostnamesOfType(hosts, 'clusterWorker'),
        },
        databases: {
          nodes: getHostnamesOfType(hosts, 'database')
        }
      }
    });

    return providerConfiguration;
  },

  /**
   * Makes a backend call to start cluster deployment and watches deployment process.
   * Returned promise resolves when deployment started (NOTE: not when it finishes).
   * The promise resolves with a jq.Promise of deployment task.
   * @return {Promise}
   */
  startDeploy() {
    return new Promise((resolve, reject) => {
      // TODO use oneprovider or onezone api
      let onepanelServer = this.get('onepanelServer');
      let providerConfiguration = this.createProviderConfiguration();
      let startConfiguringProvider =
        onepanelServer.request('oneprovider', 'configureProvider',
          providerConfiguration);

      startConfiguringProvider.then(resolve, reject);
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

  actions: {
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
      // TODO do not allow if not valid data
      let startingDeploy = this.startDeploy();
      startingDeploy.then(({
        data,
        task
      }) => {
        this.showDeployProgress(task);

        task.done(taskStatus => {
          if (taskStatus.status === StatusEnum.ok) {
            this.configureProviderFinished(taskStatus);
          } else {
            this.configureProviderFailed({
              taskStatus
            });
          }

        });

        task.fail(error => this.configureProviderFailed({
          error
        }));

        task.always(() => this.hideDeployProgress());
      });

      return startingDeploy;
    }
  }
});
