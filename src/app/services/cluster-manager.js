/**
 * Provides data for routes and components assoctiated with clusters tab
 *
 * @module services/cluster-manager
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import ClusterInfo from 'onepanel-gui/models/cluster-info';
import ClusterDetails from 'onepanel-gui/models/cluster-details';

const {
  Service,
  inject: {
    service
  },
  RSVP: { Promise },
  A,
  computed,
  computed: { readOnly },
  ObjectProxy,
  PromiseProxyMixin,
  String: { camelize }
} = Ember;

const ObjectPromiseProxy = ObjectProxy.extend(PromiseProxyMixin);

const THIS_CLUSTER_ID = 'the-cluster';
const THIS_CLUSTER_NAME = 'The cluster';

export default Service.extend({
  onepanelServer: service(),
  onepanelServiceType: readOnly('onepanelServer.serviceType'),

  /**
   * TODO when creating "the only cluster" get info about deployment state
   * This is something like a store
   * @return {Ember.A<ClusterInfo>}
   */
  clustersProxy: computed(function () {
    return ObjectPromiseProxy.create({
      promise: this.getClusters()
    });
  }),

  getClusters() {
    return new Promise((resolve) => {
      let thisCluster = ClusterInfo.create({
        id: THIS_CLUSTER_ID,
        name: THIS_CLUSTER_NAME,
      });
      resolve(A([thisCluster]));
    });
  },

  // TODO: in future this should be able to get details of any cluster 
  // in system  
  getClusterDetails( /*clusterId*/ ) {
    return new Promise((resolve) => {
      let gettingInitStep = this._getThisClusterInitStep();

      gettingInitStep.then(step => {
        resolve(ClusterDetails.create({
          clusterInfo: this.get('clustersProxy.content.firstObject'),
          initStep: step,
        }));
      });
    });
  },

  /**
   * @returns {Promise}
   */
  _checkIsConfigurationDone(onepanelServer) {
    let onepanelServiceType = this.get('onepanelServiceType');
    return new Promise((resolve, reject) => {
      let gettingConfiguration = onepanelServer.request(
        'one' + onepanelServiceType,
        camelize(`get-${onepanelServiceType}-configuration`)
      );

      // TODO do something with fetched configuration

      gettingConfiguration.then(({ data }) => resolve(!!data));

      gettingConfiguration.catch(error => {
        let statusCode = error.response.statusCode;
        if (statusCode === 404) {
          // no configuration found - user didn't started the deployment
          resolve(false);
        } else {
          reject(error);
        }
      });
    });
  },

  // TODO allow only in provider mode  
  /**
   * @param {OnepanelServer} onepanelServer
   * @returns {Promise}
   */
  _checkIsProviderRegistered(onepanelServer) {
    return new Promise((resolve, reject) => {
      let gettingProvider = onepanelServer.request('oneprovider',
        'getProvider');

      gettingProvider.then(({ data: providerDetails }) => {
        // if details found, then the provider was registered
        resolve(!!providerDetails);
      });
      gettingProvider.catch(error => {
        let statusCode = error.response.statusCode;
        if (statusCode === 404) {
          // not registered yet, maybe not deployed yet
          resolve(false);
        } else {
          reject(error);
        }
      });
    });
  },

  // TODO allow only in provider mode  
  /**
   * @param {OnepanelServer} onepanelServer
   * @returns {Promise}
   */
  _checkIsAnyStorage( /*onepanelServer*/ ) {
    return new Promise((resolve /*, reject*/ ) => {
      // FIXME checking storages does not works because of bug: swagger inconsistent with real API

      // let gettingStorages = onepanelServer.request('oneprovider',
      //   'getStorages');
      // gettingStorages.then(({ data: storages }) => {
      //   resolve(!!storages && storages.length > 0);
      // });
      // gettingStorages.catch(reject);
      resolve(true);
    });
  },

  /**
   * The promise resolves with number of initial cluster deployment step, that
   * should be opened for this cluster.
   *
   * The returned promise resolves with one of Number indicating wchich step had been done:
   * - 0: no installation done, initial
   * state, show "you have no cluster yet..."
   * - 1: installation done, but not registered - show registration step
   * - 2: installation and registration done, but no storage added yet - show add storage step
   * - 3: all done, should not show steps
   * @returns {Promise}
   */
  _getThisClusterInitStep() {
    let {
      onepanelServer,
      onepanelServiceType,
    } = this.getProperties('onepanelServer', 'onepanelServiceType');

    return new Promise((resolve, reject) => {
      let checkConfig = this._checkIsConfigurationDone(onepanelServer);

      checkConfig.then(isConfigurationDone => {
        if (isConfigurationDone) {
          // TODO VFS-3119
          if (onepanelServiceType === 'zone') {
            resolve(1);
          } else {
            let checkRegister = this._checkIsProviderRegistered(onepanelServer);
            checkRegister.then(isProviderRegistered => {
              if (isProviderRegistered) {
                let checkStorage = this._checkIsAnyStorage(onepanelServer);
                checkStorage.then(isAnyStorage => {
                  if (isAnyStorage) {
                    resolve(3);
                  } else {
                    resolve(2);
                  }
                });
                checkStorage.catch(reject);
              } else {
                resolve(1);
              }
            });
            checkRegister.catch(reject);
          }
        } else {
          resolve(0);
        }
      });
      checkConfig.catch(reject);
    });
  },

  /**
   * @return {HostInfo}
   */
  getHosts() {
    return new Promise((resolve, reject) => {
      let gettingHostNames = this.getHostNames();

      gettingHostNames.then(({ data: hostnames }) => {
        // TODO more info
        resolve(hostnames.map(hostname => ({
          hostname
        })));
      });

      gettingHostNames.catch(error => {
        console.error(
          'service:cluster-manager: Getting hostnames failed'
        );
        reject(error);
      });
    });
  },

  getHostNames() {
    let onepanelServer = this.get('onepanelServer');
    return new Promise((resolve, reject) => {
      let gettingClusterHosts = onepanelServer.request(
        'onepanel',
        'getClusterHosts', {
          discovered: true
        });
      gettingClusterHosts.then(resolve, reject);
    });
  }
});
