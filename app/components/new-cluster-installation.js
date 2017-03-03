import Ember from 'ember';
import Onepanel from 'npm:onepanel';

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

function getTaskId(location) {
  return location.match(/^.*\/(.*)$/)[1];
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

  watchTaskStatus(taskId, success, error, progress, getStatusError) {
    let onepanelServer = this.get('onepanelServer');
    let gettingTaskStatus = onepanelServer.request('onepanel', 'getTaskStatus', taskId);
    let deferSelf = (timeout) => {
      setTimeout(() => this.watchTaskStatus(...arguments), timeout);
    };
    gettingTaskStatus.then(({ data: taskStatus }) => {
      switch (taskStatus.status) {
        case StatusEnum.ok:
          if (success) {
            success(taskStatus);
          }
          break;
        case StatusEnum.error:
          if (error) {
            error(taskStatus);
          }
          break;
        case StatusEnum.running:
          if (progress) {
            progress(taskStatus);
          }
          deferSelf(1000);
          break;
        default:
          console.warn('watchTaskStatus: invalid taskStatus: ' + JSON.serialize('taskStatus'));
          deferSelf(1000);
          break;
      }
    });
    gettingTaskStatus.catch(error => {
      console.error('component:new-cluster-installation: getting status of configure task failed');
      if (getStatusError) {
        getStatusError(error);
      }
      deferSelf(2000);
    });
  },

  /**
   * @return {Promise}  promise resolves if configuration completes (either success or fail);
   *                    rejects when getting status failed
   */
  configureProviderStarted(data, response) {
    assert(
      'configure provider response should have location header',
      response && response.headers && response.headers.location
    );
    let taskId = getTaskId(response.headers.location);
    // TODO use real location from response header
    // let taskId = getTaskId('/api/v3/onepanel/tasks/f-qlxZUv-Qy7fbZBv4l7ekHJ4xlKES3AXS2gMYYTYf4');
    return new Promise((resolveConfiguration, rejectConfiguration) => {
      let onSuccess = function (taskStatus) {
        resolveConfiguration(taskStatus);
      };
      let onError = function (taskStatus) {
        rejectConfiguration(taskStatus);
      };
      this.watchTaskStatus(taskId, onSuccess, onError);
    });

    // TODO get "location" header, parse from /api/v3/onepanel/tasks/f-qlxZUv-Qy7fbZBv4l7ekHJ4xlKES3AXS2gMYYTYf4



    // TODO handle reject


  },

  configureProviderFinished() {
    // TODO get name for cluster from user
    let id = 'x';

    let creatingCluster = this.get('clusterManager').createCluster({
      id,
      label: 'New cluster'
    });

    creatingCluster.then(cluster => {
      this.sendAction('clusterCreated', cluster);
      this.sendAction('nextStep');
    });
  },

  configureProviderFailed(error) {
    console.error(`Configure provider failed (${error.response.statusCode}): ${error.response.text}`)
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
   * @return {Promise}
   */
  deploy() {
    return new Promise((deployResolve, deployReject) => {
      // TODO use oneprovider or onezone api
      let onepanelServer = this.get('onepanelServer');
      let providerConfiguration = this.createProviderConfiguration();
      let configuringProvider =
        onepanelServer.request('oneprovider', 'configureProvider', providerConfiguration);

      configuringProvider.then(({ data, response }) => {
        let configuring = this.configureProviderStarted(data, response);
        configuring.then(({ data }) => {
          this.configureProviderFinished(data);
          deployResolve(data);
        });
        configuring.catch(error => {
          this.configureProviderFailed(error);
          deployReject(error);
        });
      });

      configuringProvider.catch(error => {
        this.configureProviderFailed(error);
        deployReject(error);
      });
    });
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

    startDeploy() {
      // TODO do not allow if not valid data
      return this.deploy();
    }
  }
});
