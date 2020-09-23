/**
 * Provides backend operations for spaces in onepanel
 *
 * @module services/space-manager
 * @author Jakub Liput
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { A } from '@ember/array';

import Service, { inject as service } from '@ember/service';
import { Promise, resolve } from 'rsvp';
import { get } from '@ember/object';
import Onepanel from 'npm:onepanel';
import SpaceDetails from 'onepanel-gui/models/space-details';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import PromiseUpdatedObject from 'onedata-gui-common/utils/promise-updated-object';
import emberObjectReplace from 'onedata-gui-common/utils/ember-object-replace';
import _ from 'lodash';

const {
  SpaceSupportRequest,
} = Onepanel;

const SYNC_METRICS = ['queueLength', 'insertCount', 'updateCount', 'deleteCount'];
const DEFAULT_SYNC_STATS_PERIOD = 'minute';

export default Service.extend({
  onepanelServer: service(),

  /**
   * Stores collection of all fetched spaces
   * @type {PromiseObject}
   */
  spacesCache: PromiseObject.create(),

  reportsCache: Object.freeze({}),

  init() {
    this._super(...arguments);
    this.set('reportsCache', {});
  },

  /**
   * @param {boolean} reload if true, force request to server even if there is cache
   * @returns {PromiseObject<Ember.Array<PromiseUpdatedObject<OnepanelGui.SpaceDetails>>>}
   */
  getSpaces(reload = true) {
    const spacesCache = this.get('spacesCache');
    if (reload || !get(spacesCache, 'content')) {
      spacesCache.set('promise', this._getSpaces());
    }
    return spacesCache;
  },

  /** 
   * @returns {Promise<Ember.Array<PromiseUpdatedObject<OnepanelGui.SpaceDetails>>>}
   */
  _getSpaces() {
    let onepanelServer = this.get('onepanelServer');
    return onepanelServer.requestValidData(
      'oneprovider',
      'getProviderSpaces'
    ).then(({ data: { ids } }) => {
      return A(ids.map(id => this.getSpaceDetails(id)));
    });
  },

  /**
   * Update record inside created spaces collection
   * Requires former usage of `getSpaces`!
   * @param {string} spaceId space with this ID will be updated
   * @returns {Promise<OnepanelGui.SpaceDetails>}
   */
  updateSpaceDetailsCache(spaceId) {
    const cacheArray = this.get('spacesCache.content');
    const spaceCacheProxy = _.find(
      cacheArray,
      s => get(s, 'content.id') === spaceId
    );
    const spaceCache = get(spaceCacheProxy, 'content');
    const promise = this._getSpaceDetails(spaceId)
      .then(spaceDetails => {
        return emberObjectReplace(spaceCache, spaceDetails);
      });
    spaceCacheProxy.set('promise', promise);
    return promise;
  },

  /**
   * Fetch details of space support with given ID
   * 
   * @param {string} id
   * @return {PromiseUpdatedObject} resolves SpaceDetails object
   */
  getSpaceDetails(id) {
    return PromiseUpdatedObject.create({ promise: this._getSpaceDetails(id) });
  },

  /**
   * Fetch and create _new_ OnepanelGui.SpaceDetails object
   * @param {string} id
   * @returns {Promise<OnepanelGui.SpaceDetails>}
   */
  _getSpaceDetails(id) {
    return this.get('onepanelServer').requestValidData(
      'oneprovider',
      'getSpaceDetails',
      id
    ).then(({ data }) => SpaceDetails.create(data));
  },

  /**
   * @param {string} id
   * @param {SpaceModifyRequest} spaceData fields of space to be changed
   * @param {StorageImportDetails} spaceData.storageImport
   * @param {StorageUpdateDetails} spaceData.storageUpdate
   * @returns {Promise<undefined|object>} resolves after updating details cache
   */
  modifySpaceDetails(id, spaceData) {
    let onepanelServer = this.get('onepanelServer');
    return onepanelServer
      .request('oneprovider', 'modifySpace', id, spaceData)
      .catch(modifyError =>
        this.updateSpaceDetailsCache(id).finally(() => {
          throw modifyError;
        })
      )
      .then(() => this.updateSpaceDetailsCache(id));
  },

  /**
   * Support space in current provider using some storage
   * 
   * @param {Object} supportSpaceData
   * @param {number} supportSpaceData.size
   * @param {string} supportSpaceData.storageId
   * @param {string} supportSpaceData.token
   * @returns {Promise}
   */
  supportSpace(supportSpaceData) {
    let onepanelServer = this.get('onepanelServer');
    let supportReq = SpaceSupportRequest.constructFromObject(supportSpaceData);
    return onepanelServer.request('oneprovider', 'supportSpace', supportReq);
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
    return this.get('onepanelServer').requestValidData(
      'oneprovider',
      'getProviderSpaceAutoCleaningStatus',
      spaceId
    ).then(({ data }) => data);
  },

  /**
   * @param {string} spaceId
   * @param {number} startFromIndex
   * @param {number} size
   * @param {number} offset
   * 
   * @returns {Promise<Onepanel.SpaceAutoCleaningReportCollection>}
   */
  getAutoCleaningReportIds(spaceId, startFromIndex, size, offset) {
    return this.get('onepanelServer').request(
      'oneprovider',
      'getProviderSpaceAutoCleaningReports',
      spaceId, {
        index: startFromIndex,
        limit: size,
        offset,
      }
    ).then(({ data }) => data.ids);
  },

  getAutoCleaningReport(spaceId, reportId, reload = false) {
    const reportsCache = this.get('reportsCache');
    const spaceReportsCache = reportsCache[spaceId];
    let isCurrentReportInCache = !reload && spaceReportsCache &&
      spaceReportsCache.hasOwnProperty(reportId);
    let cachedReport;
    if (isCurrentReportInCache) {
      cachedReport = spaceReportsCache[reportId];
      // if stoppedAt is present, the report was finished, so the cache is current
      isCurrentReportInCache = Boolean(cachedReport.stoppedAt);
    }
    if (isCurrentReportInCache) {
      return resolve(cachedReport);
    } else {
      return this.get('onepanelServer').request(
        'oneprovider',
        'getProviderSpaceAutoCleaningReport',
        spaceId,
        reportId,
      ).then(({ data }) => {
        let spaceReportsCache = reportsCache[spaceId];
        if (!spaceReportsCache) {
          spaceReportsCache = reportsCache[spaceId] = {};
        }
        const report = spaceReportsCache[reportId] = data;
        return resolve(report);
      });
    }
  },

  getAutoCleaningReports(spaceId, startFromIndex, size, offset) {
    return this.getAutoCleaningReportIds(
      spaceId,
      startFromIndex,
      size,
      offset
    ).then(ids => Promise.all(ids.map(id =>
      this.getAutoCleaningReport(spaceId, id)
    )));
  },

  startCleaning(spaceId) {
    return this.get('onepanelServer').request(
      'oneprovider',
      'triggerAutoCleaning',
      spaceId,
    ).then(({ data }) => data);
  },

});
