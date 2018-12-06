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
   * @param {boolean} suppressNotDeployed if true, "ceph not deployed" error
   *   will be ignored
   * @return {PromiseArray<Onepanel.CephOsd>}
   */
  getOsds(suppressNotDeployed = false) {
    const onepanelServer = this.get('onepanelServer');
    let promise = onepanelServer.request('oneprovider', 'getCephOsds')
      .then(({ data }) => data);
    if (suppressNotDeployed) {
      promise = this.suppressNotDeployed(promise, []);
    }
    return PromiseArray.create({ promise });
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

  getNextOsdId() {
    const onepanelServer = this.get('onepanelServer');
    return PromiseObject.create({
      promise: onepanelServer.request('oneprovider', 'getNextOsdId')
        .then(({ data }) => data),
    });
  },

  /**
   * Checks whether embedded ceph storage can be created or not
   * @returns {PromiseObject<boolean>} resolves to true if ceph embedded storage
   *   can be created
   */
  canCreateStorage() {
    const promise = this.getOsds().then(osds => get(osds, 'length'));
    return PromiseObject.create({
      promise: this.suppressNotDeployed(promise, false),
    });
  },

  /**
   * Converts error "ceph not deployed" to positive promise with defaultValue
   * as a value
   * @param {Promise<any>} promise Promise which can result to
   *   "ceph not deployed" error (statusCode == 404)
   * @param {any} defaultValue value to which promise should resolve when
   *   "ceph not deployed" error occurred
   * @returns {Promise<any>} original promise with suppressed "ceph not deployed"
   *   error
   */
  suppressNotDeployed(promise, defaultValue) {
    return promise.catch(error => {
      if (get(error, 'response.statusCode') === 404) {
        return defaultValue;
      } else {
        throw error;
      }
    });
  },
});
