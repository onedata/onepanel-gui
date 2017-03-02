import Ember from 'ember';
import Onepanel from 'npm:onepanel';

const {
  assert,
  inject: {
    service
  }
} = Ember;

const {
  ProviderConfiguration
} = Onepanel;

let ObjectPromiseProxy = Ember.ObjectProxy.extend(Ember.PromiseProxyMixin);

function getClusterHostname(hostnames) {
  return hostnames.objectAt(0);
}

function getDomain(hostname) {
  return hostname.split('.').splice(1).join('.');
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
  
  configureProviderStarted(data) {
    // TODO use real location from response header
    let taskId = getTaskId('/api/v3/onepanel/tasks/f-qlxZUv-Qy7fbZBv4l7ekHJ4xlKES3AXS2gMYYTYf4');
    return new Promise((resolve, reject) => {
      let gettingTasksStatus = onepanelApi.getTaskStatus();
      gettingTasksStatus.then((data) => {
        // TODO: get status: ok, error, running
        // if running -> set next timeout that will invoke
      });
      
      let configureStatusPolling = setTimeout(() => {
        
      });
    });
    
    // TODO get name for cluster from user
    let id = 'x';
    
    // TODO get "location" header, parse from /api/v3/onepanel/tasks/f-qlxZUv-Qy7fbZBv4l7ekHJ4xlKES3AXS2gMYYTYf4
    
    let onepanelApi = this.get('onepanelServer.onepanelApi');
    
    
    // TODO: status polling 1s, then resolve
    
    let creatingCluster = this.get('clusterManager').createCluster({
      id,
      label: 'New cluster'
    });
    
    // TODO handle reject
    

  },
  
  configureProviderFinished() {
    creatingCluster.then(cluster => {
      this.sendAction('clusterCreated', cluster);
      this.sendAction('nextStep');
    });
  },
  
  configureProviderStartFailed(error) {
    console.error(`Configure provider failed (${error.response.statusCode}): ${error.response.text}`)
    debugger;
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
    
    deploy() {
      let {
        hosts,
        onepanelServer,
        primaryClusterManager
      } = this.getProperties(
         'hosts',
         'onepanelServer',
         'primaryClusterManager'
      );
      // TODO use API
      
      hosts = hosts.content;
      
      // TODO use oneprovider or onezone api
      let api = onepanelServer.get('oneproviderApi');
      
      let hostnames = hosts.map(h => h.hostname);
      
      // TODO get domain... lists:usort(CmHosts ++ WrHosts ++ DbHosts), get_domain(hd(Hosts))
      let domainName = getDomain(getClusterHostname(hostnames));
      let autoDeploy = true;
      let clusterManagers = getHostnamesOfType(hosts, 'clusterManager');
      
      // FIXME
      // primary cluster manager should be first on the list
      // let primaryCMIndex = clusterManagers.indexOf(primaryClusterManager);
      // [clusterManagers[0], clusterManagers[primaryCMIndex]] =
      //   [primaryClusterManager, clusterManagers[0]];
      
      let clusterWorkers = getHostnamesOfType(hosts, 'clusterWorker');
      let databases = getHostnamesOfType(hosts, 'database');
      
      let nodes = {};
      hostnames.forEach(hn => {
        nodes[hn] = {
          hostname: hn
        };
      });
      
      var providerConfiguration = ProviderConfiguration.constructFromObject({
        cluster: {
          domainName,
          autoDeploy,
          nodes,
          managers: {
            mainNode: primaryClusterManager,
            nodes: clusterManagers,
          },
          workers: {
            nodes: clusterWorkers,
          },
          databases: {
            nodes: databases
          } 
        }
      });
      
      let configuringProvider = api.configureProvider(providerConfiguration);
      
      configuringProvider.then(
        this.configureProviderStarted.bind(this),
        this.configureProviderStartFailed.bind(this)
      );
      
      // TODO do not allow if not invalid data

    },
  }
});
