import Ember from 'ember';
import Onepanel from 'npm:onepanel';
import getTaskId from 'ember-onedata-onepanel-server/utils/get-task-id';
import watchTaskStatus from 'ember-onedata-onepanel-server/utils/watch-task-status';

const {
  assert,
  inject: {
    service
  },
  RSVP: {
    Promise
  }
} = Ember;

const {
  ProviderConfiguration,
  TaskStatus: {
    StatusEnum
  }
} = Onepanel;

let ObjectPromiseProxy = Ember.ObjectProxy.extend(Ember.PromiseProxyMixin);

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

export default Ember.Component.extend({
  onepanelServer: service(),
  clusterManager: service(),

  primaryClusterManager: null,

  /**
   * @type {ObjectPromiseProxy<Ember.A<HostInfo>>}
   */
  hosts: null,

  init() {
    this._super(...arguments);
    this.set(
      'hosts',
      ObjectPromiseProxy.create({
        promise: this.get('clusterManager').getHosts()
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
      console.error(`Configure provider failed (${error.response.statusCode}): ${error.response.text}`);
    } else if (taskStatus) {
      console.error(`Configure provider failed: ${JSON.stringify(taskStatus)}`);
    }
  },

  getNodes() {
    let hosts = this.get('hosts');
    hosts = hosts.content;
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

    hosts = hosts.content;

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
        onepanelServer.request('oneprovider', 'configureProvider', providerConfiguration);

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
    checkboxChanged(checked, event) {
      let hosts = this.get('hosts.content');
      let checkbox = event.currentTarget;
      let hostname = checkbox.getAttribute('data-hostname');
      let option = checkbox.getAttribute('data-option');
      let host = hosts.find(h => h.hostname === hostname);
      assert(
        host,
        'host for which option was changed, must be present in collection'
      );
      host[option] = checked;

      // TODO debug
      console.debug(JSON.stringify(hosts));
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
