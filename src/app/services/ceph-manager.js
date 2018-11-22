import Service, { inject as service } from '@ember/service';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import CephClusterConfiguration from 'onepanel-gui/utils/ceph/cluster-configuration';
import _ from 'lodash';
import { getOwner } from '@ember/application';
import { get } from '@ember/object';

export default Service.extend({
  onepanelServer: service(),

  /**
   * Returns all osds in the ceph cluster.
   * @return {PromiseArray<Onepanel.CephOsd>}
   */
  getOsds() {
    const onepanelServer = this.get('onepanelServer');
    return PromiseArray.create({
      promise: onepanelServer.request('oneprovider', 'getCephOsds')
        .then(({ data }) => data),
    });
  },

  /**
   * Returns all monitors in the ceph cluster.
   * @return {PromiseArray<Onepanel.CephMonitor>}
   */
  getMonitors() {
    const onepanelServer = this.get('onepanelServer');
    return PromiseArray.create({
      promise: onepanelServer.request('oneprovider', 'getCephMonitors')
        .then(({ data }) => data),
    });
  },

  /**
   * Returns ceph cluster configuration - aggregates results from multiple
   * requests to form complex configuration object.
   * @return {PromiseObject<Utils/Ceph/ClusterConfiguration>}
   */
  getConfiguration() {
    const onepanelServer = this.get('onepanelServer');
    return PromiseObject.create({
      promise: Promise.all([
        onepanelServer.request('oneprovider', 'getCephManagers'),
        get(this.getMonitors(), 'promise'),
        get(this.getOsds(), 'promise'),
        onepanelServer.request('oneprovider', 'getCephParams'),
      ]).then(([
        { data: managers },
        monitors,
        osds,
        { data: general },
      ]) => {
        const rawConfig = _.assign({}, general, {
          managers,
          monitors,
          osds,
        });
        const config = CephClusterConfiguration.create(
          getOwner(this).ownerInjection()
        );
        config.fillIn(rawConfig);
        return config;
      }),
    });
  },

  /**
   * @return {PromiseObject<CephStatus>}
   */
  getStatus() {
    const onepanelServer = this.get('onepanelServer');
    return PromiseObject.create({
        promise: onepanelServer.request('oneprovider', 'getCephStatus')
          .then(({ data }) => data),
    });
  },

  getOsdsUsage() {
    const onepanelServer = this.get('onepanelServer');
    return PromiseObject.create({
      promise: onepanelServer.request('oneprovider', 'getCephUsage')
        .then(({ data: { osds } }) => osds),
    });
  },

  getOsdsWithUsage() {
    return PromiseObject.create({
      promise: Promise.all([
        get(this.getOsds(), 'promise'),
        get(this.getOsdsUsage(), 'promise'),
      ]).then(([osds, usage]) => ({
        osds,
        usage,
      })),
    });
  },

  getPools() {
    const onepanelServer = this.get('onepanelServer');
    return PromiseArray.create({
      promise: onepanelServer.request('oneprovider', 'getCephPools')
        .then(({ data }) => data),
    });
  },

  getPoolsUsage() {
    const onepanelServer = this.get('onepanelServer');
    return PromiseObject.create({
      promise: onepanelServer.request('oneprovider', 'getCephUsage')
        .then(({ data: { pools } }) => pools),
    });
  },

  getPoolsWithUsage() {
    return PromiseObject.create({
      promise: Promise.all([
        get(this.getPools(), 'promise'),
        get(this.getPoolsUsage(), 'promise'),
      ]).then(([pools, usage]) => ({
        pools,
        usage,
      })),
    });
  },

  createPool(poolData) {
    return this.get('onepanelServer')
      .request('oneprovider', 'addCephPool', poolData);
  },
});
