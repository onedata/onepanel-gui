/**
 * Provides backend operations for spaces in onepanel
 *
 * @module services/space-manager
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
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

const IMPORT_METRICS = ['queueLength', 'createdFiles', 'modifiedFiles', 'deletedFiles'];
const DEFAULT_IMPORT_STATS_PERIOD = 'minute';

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
   * @param {StorageImport} spaceData.storageImport
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

  ceaseOneproviderSupport(space) {
    return this.get('onepanelServer')
      .request('oneprovider', 'revokeSpaceSupport', get(space, 'id'));
  },

  /**
   * Fetch current import info
   *
   * @param {String} spaceId
   * @returns {Promise<Onepanel.AutoStorageImportInfo>}
   */
  getImportInfo(spaceId) {
    return this.get('onepanelServer').request(
      'oneprovider',
      'getAutoStorageImportInfo',
      spaceId
    ).then(({ data }) => data);
  },

  /**
   * Fetch current import statistics with given configuration
   *
   * @param {String} spaceId
   * @param {String} [period] one of: minute, hour, day
   * @param {Array<String>|String} [metrics] array with any of: queueLength, insertCount,
   *  updateCount, deleteCount or a string containing any of these values joined with `,`
   * @returns {Promise<Onepanel.AutoStorageImportStats>}
   */
  getImportStats(
    spaceId,
    period = DEFAULT_IMPORT_STATS_PERIOD,
    metrics = IMPORT_METRICS
  ) {
    return this.get('onepanelServer').request(
      'oneprovider',
      'getAutoStorageImportStats',
      spaceId,
      period,
      // convert metrics to special-format string that holds an array
      Array.isArray(metrics) ? metrics.join(',') : metrics,
    ).then(({ data }) => data);
  },

  /**
   * Fetch example of the file registration request in manual storage import
   * 
   * @param {String} spaceId 
   * @returns {Promise<Onepanel.ManualStorageImportExample>}
   */
  getManualImportRequestExample(spaceId) {
    return this.get('onepanelServer').request(
      'oneprovider',
      'getManualStorageImportExample',
      spaceId
    ).then(({ data }) => data);
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

  /**
   * @param {String} spaceId 
   * @returns {Promise}
   */
  stopImportScan(spaceId) {
    return this.get('onepanelServer').request(
      'oneprovider',
      'forceStopAutoStorageImportScan',
      spaceId,
    );
  },

  /**
   * @param {String} spaceId 
   * @returns {Promise}
   */
  startImportScan(spaceId) {
    return this.get('onepanelServer').request(
      'oneprovider',
      'forceStartAutoStorageImportScan',
      spaceId,
    );
  },
});
