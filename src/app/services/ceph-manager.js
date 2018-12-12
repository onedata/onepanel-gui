/**
 * Provides data related to Ceph cluster configuration
 *
 * @module services/ceph-manager
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

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
   *   will be ignored and converted to [] value
   * @return {PromiseArray<Onepanel.CephOsd>}
   */
  getOsds(suppressNotDeployed = false) {
    const onepanelServer = this.get('onepanelServer');
    let promise = onepanelServer.request('oneprovider', 'getCephOsds')
      .then(({ data: { osds } }) => osds);
    if (suppressNotDeployed) {
      promise = this.suppressNotDeployed(promise, []);
    }
    return PromiseArray.create({ promise });
  },

  /**
   * Returns all managers in the ceph cluster.
   * @return {PromiseArray<Onepanel.CephManager>}
   */
  getManagers() {
    const onepanelServer = this.get('onepanelServer');
    return PromiseArray.create({
      promise: onepanelServer.request('oneprovider', 'getCephManagers')
        .then(({ data: { managers } }) => managers),
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
        .then(({ data: { monitors } }) => monitors),
    });
  },

  /**
   * Returns global ceph parameters
   * @return {PromiseArray<Onepanel.CephGlobalParams>}
   */
  getParams() {
    const onepanelServer = this.get('onepanelServer');
    return PromiseObject.create({
      promise: onepanelServer.request('oneprovider', 'getCephParams')
        .then(({ data }) => data),
    });
  },

  /**
   * Returns ceph cluster configuration - aggregates results from multiple
   * requests to form complex configuration object.
   * @return {PromiseObject<Utils/Ceph/ClusterConfiguration>}
   */
  getConfiguration() {
    return PromiseObject.create({
      promise: Promise.all([
        this.getManagers(),
        this.getMonitors(),
        this.getOsds(),
        this.getParams(),
      ]).then(([
        managers,
        monitors,
        osds,
        params,
      ]) => {
        const rawConfig = _.assign({}, params, {
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
   * Returns Ceph cluster status
   * @return {PromiseObject<Onepanel.CephStatus>}
   */
  getStatus() {
    const onepanelServer = this.get('onepanelServer');
    return PromiseObject.create({
      promise: onepanelServer.request('oneprovider', 'getCephStatus')
        .then(({ data }) => data),
    });
  },

  /**
   * Returns Ceph OSDs usage
   * @return {PromiseObject<Object>} Object osdId -> Onepanel.DataUsage
   */
  getOsdsUsage() {
    const onepanelServer = this.get('onepanelServer');
    return PromiseObject.create({
      promise: onepanelServer.request('oneprovider', 'getCephUsage')
        .then(({ data: { osds } }) => osds),
    });
  },

  /**
   * Returns Ceph OSDs and OSDs usage
   * @return {PromiseObject<Object>} Object with fields: osds, usage
   */
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

  /**
   * Returns Ceph cluster pools
   * @return {PromiseArray<Onepanel.CephPool>}
   */
  getPools() {
    const onepanelServer = this.get('onepanelServer');
    return PromiseArray.create({
      promise: onepanelServer.request('oneprovider', 'getCephPools')
        .then(({ data: { pools } }) => pools),
    });
  },

  /**
   * Returns Ceph pools usage
   * @return {PromiseObject<Object>} Object name -> Onepanel.PoolUsage
   */
  getPoolsUsage() {
    const onepanelServer = this.get('onepanelServer');
    return PromiseObject.create({
      promise: onepanelServer.request('oneprovider', 'getCephUsage')
        .then(({ data: { pools } }) => pools),
    });
  },

  /**
   * Returns Ceph pools and pools usage
   * @return {PromiseObject<Object>} Object with fields: pools, usage
   */
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

  /**
   * Returns next possible Osd Id
   * @returns {PromiseObject<number>}
   */
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
   * Checks whether ceph has been deployed or not
   * @returns {PromiseObject<boolean>}
   */
  isDeployed() {
    const promise = get(this.getParams(), 'promise').then(() => true);
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
