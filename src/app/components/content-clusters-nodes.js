import Ember from 'ember';

import ClusterHostInfo from 'onepanel-gui/models/cluster-host-info';

const {
  A,
  Component,
  inject: { service },
  ObjectProxy,
  PromiseProxyMixin,
  RSVP: { Promise },
} = Ember;

const ObjectPromiseProxy = ObjectProxy.extend(PromiseProxyMixin);

export default Component.extend({
  onepanelServer: service(),
  clusterManager: service(),
  globalNotify: service(),

  /**
   * Resolves with EmberArray of HostInfo.
   * @type {ObjectPromiseProxy.EmberArray.HostInfo}
   */
  hostsProxy: null,

  init() {
    this._super(...arguments);
    this.set(
      'hostsProxy',
      ObjectPromiseProxy.create({
        promise: new Promise((resolve, reject) => {
          let gettingHosts = this.get('clusterManager').getHosts();
          gettingHosts.then(hosts => {
            hosts = A(hosts.map(h => ClusterHostInfo.create(h)));
            resolve(hosts);
          });
          gettingHosts.catch(reject);
        })
      })
    );
  },
});
