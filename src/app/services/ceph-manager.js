/**
 * Provides data related to Ceph cluster configuration
 *
 * @module services/ceph-manager
 * @author Michał Borzęcki
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import CephClusterConfiguration from 'onepanel-gui/utils/ceph/cluster-configuration';
import _ from 'lodash';
import { getOwner } from '@ember/application';
import { get, computed } from '@ember/object';
import ObjectProxy from '@ember/object/proxy';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

export default Service.extend({
  onepanelServer: service(),

  /**
   * Is filled with content on service init
   * @type {ObjectProxy<Onepanel.CephStatus>}
   */
  status: computed(function status() {
    return ObjectProxy.create();
  }),

  init() {
    this._super(...arguments);
    
    // initialize status property with actual status
    this.getStatus();
  },

  /**
   * Returns all osds in the ceph cluster.
   * @return {Promise<Array<Onepanel.CephOsd>>}
   */
  getOsds() {
    return this.get('onepanelServer').request('oneprovider', 'getCephOsds')
      .then(({ data: { osds } }) => osds);
  },

  /**
   * Returns all managers in the ceph cluster.
   * @return {Promise<Array<Onepanel.CephManager>>}
   */
  getManagers() {
    return this.get('onepanelServer').request('oneprovider', 'getCephManagers')
      .then(({ data: { managers } }) => managers);
  },

  /**
   * Returns all monitors in the ceph cluster.
   * @return {Promise<Array<Onepanel.CephMonitor>>}
   */
  getMonitors() {
    return this.get('onepanelServer').request('oneprovider', 'getCephMonitors')
      .then(({ data: { monitors } }) => monitors);
  },

  /**
   * Returns global ceph parameters
   * @return {Promise<Array<Onepanel.CephGlobalParams>>}
   */
  getParams() {
    return this.get('onepanelServer').request('oneprovider', 'getCephParams')
      .then(({ data }) => data);
  },

  /**
   * Returns ceph cluster configuration - aggregates results from multiple
   * requests to form complex configuration object.
   * @return {Promise<Utils/Ceph/ClusterConfiguration>}
   */
  getConfiguration() {
    return Promise.all([
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
    });
  },

  /**
   * Returns Ceph cluster status
   * @return {Promise<Onepanel.CephStatus>}
   */
  getStatus() {
    const promise = this.get('onepanelServer')
      .request('oneprovider', 'getCephStatus')
      .then(({ data }) => data);

    // update status property with new value
    promise.then(status =>
      safeExec(this, () => this.set('status.content', status))
    );

    return promise;
  },

  /**
   * Returns Ceph OSDs usage
   * @return {Promise<Object>} Object osdId -> Onepanel.DataUsage
   */
  getOsdsUsage() {
    return this.get('onepanelServer').request('oneprovider', 'getCephUsage')
      .then(({ data: { osds } }) => osds);
  },

  /**
   * Returns Ceph OSDs and OSDs usage
   * @return {Promise<Object>} Object with fields: osds, usage
   */
  getOsdsWithUsage() {
    return Promise.all([
      this.getOsds(),
      this.getOsdsUsage(),
    ]).then(([osds, usage]) => ({
      osds,
      usage,
    }));
  },

  /**
   * Returns Ceph cluster pools
   * @return {Promise<Array<Onepanel.CephPool>>}
   */
  getPools() {
    return this.get('onepanelServer').request('oneprovider', 'getCephPools')
      .then(({ data: { pools } }) => pools);
  },

  /**
   * Returns Ceph pools usage
   * @return {Promise<Object>} Object name -> Onepanel.PoolUsage
   */
  getPoolsUsage() {
    return this.get('onepanelServer').request('oneprovider', 'getCephUsage')
      .then(({ data: { pools } }) => pools);
  },

  /**
   * Returns Ceph pools and pools usage
   * @return {Promise<Object>} RObject with fields: pools, usage
   */
  getPoolsWithUsage() {
    return Promise.all([
      this.getPools(),
      this.getPoolsUsage(),
    ]).then(([pools, usage]) => ({
      pools,
      usage,
    }));
  },

  /**
   * Returns next possible Osd Id
   * @returns {Promise<number>}
   */
  getNextOsdId() {
    return this.get('onepanelServer').request('oneprovider', 'getNextOsdId')
      .then(({ data }) => data);
  },

  /**
   * Checks whether embedded ceph storage can be created or not
   * @returns {Promise<boolean>} resolves to true if ceph embedded storage
   *   can be created
   */
  canCreateStorage() {
    const promise = this.getOsds().then(osds => get(osds, 'length'));
    return this.suppressNotDeployed(promise, false);
  },

  /**
   * Checks whether ceph has been deployed or not
   * @returns {Promise<boolean>}
   */
  isDeployed() {
    const promise = this.getParams().then(() => true);
    return this.suppressNotDeployed(promise, false);
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
