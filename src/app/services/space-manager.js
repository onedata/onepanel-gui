/**
 * Provides backend operations for spaces in onepanel
 *
 * @module services/space-manager
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import Onepanel from 'npm:onepanel';

import SpaceDetails from 'onepanel-gui/models/space-details';

import _ from 'lodash';

const {
  A,
  Service,
  inject: { service },
  RSVP: { Promise },
  get,
} = Ember;

const {
  SpaceSupportRequest,
} = Onepanel;

import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';

const SYNC_METRICS = ['queueLength', 'insertCount', 'updateCount', 'deleteCount'];
const DEFAULT_SYNC_STATS_PERIOD = 'minute';

export default Service.extend({
  onepanelServer: service(),

  spacesCache: PromiseObject.create(),

  getSpaces() {
    const spacesCache = this.get('spacesCache');
    if (!get(spacesCache, 'content')) {
      spacesCache.set('promise', this._getSpaces());
    }
    return spacesCache;
  },

  _getSpaces() {
    let onepanelServer = this.get('onepanelServer');
    return onepanelServer.requestValidData(
      'oneprovider',
      'getProviderSpaces'
    ).then(({ data: { ids } }) => {
      return A(ids.map(id => this.getSpaceDetails(id)));
    });
  },

  updateSpaceDetailsCache(spaceId) {
    const cacheArray = this.get('spacesCache.content');
    const spaceIndex = _.findIndex(
      cacheArray,
      s => get(s, 'id') === spaceId
    );
    const promiseObj = this.getSpaceDetails(spaceId);
    cacheArray.objectAt(spaceIndex).set('promise', promiseObj);
    return promiseObj;
  },

  /**
   * Fetch details of space support with given ID
   * 
   * @param {string} id
   * @return {PromiseObject} resolves SpaceDetails object
   */
  getSpaceDetails(id) {
    const promise = this.get('onepanelServer').requestValidData(
      'oneprovider',
      'getSpaceDetails',
      id
    ).then(({ data }) => SpaceDetails.create(data));
    return PromiseObject.create({ promise });
  },

  /**
   * @param {string} id
   * @param {SpaceModifyRequest} spaceData fields of space to be changed
   * @param {StorageImportDetails} spaceData.storageImport
   * @param {StorageUpdateDetails} spaceData.storageUpdate
   * @returns {PromiseObject<undefined|object>}
   */
  modifySpaceDetails(id, spaceData) {
    let onepanelServer = this.get('onepanelServer');
    let promise = onepanelServer
      .request('oneprovider', 'modifySpace', id, spaceData)
      .then(({ data }) => data);
    return PromiseObject.create({ promise });
  },

  /**
   * Support space in current provider using some storage
   * 
   * @param {Object} supportSpaceData
   * @param {number} supportSpaceData.size
   * @param {string} supportSpaceData.storageId
   * @param {string} supportSpaceData.token
   * @param {boolean} [supportSpaceData.mountInRoot=undefined]
   * @returns {Promise}
   */
  supportSpace(supportSpaceData) {
    let onepanelServer = this.get('onepanelServer');
    let supportReq = SpaceSupportRequest.constructFromObject(supportSpaceData);
    return onepanelServer.request('oneprovider', 'supportSpace', supportReq);
  },

  revokeSpaceSupport(spaceId) {
    let onepanelServer = this.get('onepanelServer');
    return onepanelServer.request('oneprovider', 'revokeSpaceSupport', spaceId);
  },

  /**
   * Fetch current sync (import/update) statistics with given configuration
   *
   * There are more high-level methods that should be considered to use:
   * - getSyncStatusOnly
   * - getSyncAllStats
   *
   * @param {string} spaceId 
   * @param {string} period one of: minute, hour, day
   * @param {Array.string} metrics array with any of: queueLength, insertCount,
   *  updateCount, deleteCount
   * @returns {Promise<object>} Onepanel.ProviderAPI.getProviderSpaceSyncStats results
   */
  getSyncStats(spaceId, period, metrics) {
    // convert metrics to special-format string that holds an array
    if (Array.isArray(metrics)) {
      metrics = metrics.join(',');
    }
    return new Promise((resolve, reject) => {
      let onepanelServer = this.get('onepanelServer');
      let gettingSyncStats = onepanelServer.request(
        'oneprovider',
        'getProviderSpaceSyncStats',
        spaceId, {
          period,
          metrics,
        }
      );

      gettingSyncStats.then(({ data }) => resolve(data));
      gettingSyncStats.catch(reject);
    });
  },

  /**
   * Helper method to get only status of sync without statistics for charts
   * @param {string} spaceId
   * @returns {Promise<object>}
   */
  getSyncStatusOnly(spaceId) {
    return this.getSyncStats(spaceId);
  },

  /**
   * Get all known statistics for space synchronization needed to display
   * all charts
   *
   * @param {*} spaceId 
   * @param {string} [period] one of: minute, hour, day (like in Onepanel.SyncStats)
   * @returns {Promise<object>}
   */
  getSyncAllStats(spaceId, period = DEFAULT_SYNC_STATS_PERIOD) {
    return this.getSyncStats(spaceId, period, SYNC_METRICS);
  },

  /**
   * @param {string} spaceId
   * @returns {Promise<Onepanel.SpaceAutoCleaningStatus>}
   */
  getAutoCleaningStatus(spaceId) {
    return this.get('onepanelServer').request(
      'oneprovider',
      'getProviderSpaceAutoCleaningStatus',
      spaceId
    ).then(({ data }) => data);
  },

  /**
   * @param {string} spaceId
   * @returns {Promise<Onepanel.SpaceAutoCleaningReports>}
   */
  getAutoCleaningReports(spaceId) {
    return this.get('onepanelServer').request(
      'oneprovider',
      'getProviderSpaceAutoCleaningReports',
      spaceId
    ).then(({ data }) => data);
  },

  configureSpaceFilesPopularity(spaceId, enabled) {
    return this.get('onepanelServer').request(
      'oneprovider',
      'configureSpaceFilesPopularity',
      spaceId, {
        enabled,
      }
    ).then(({ data }) => data);
  },

});
