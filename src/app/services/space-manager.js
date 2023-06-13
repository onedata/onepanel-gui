/**
 * Provides backend operations for spaces in onepanel
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import { Promise, resolve } from 'rsvp';
import { get, set, computed } from '@ember/object';
import { bool } from 'ember-awesome-macros';
import Onepanel from 'onepanel';
import SpaceDetails from 'onepanel-gui/models/space-details';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import PromiseUpdatedObject from 'onedata-gui-common/utils/promise-updated-object';
import emberObjectReplace from 'onedata-gui-common/utils/ember-object-replace';
import BatchResolver from 'onedata-gui-common/utils/batch-resolver';

const {
  SpaceSupportRequest,
} = Onepanel;

const IMPORT_METRICS = ['queueLength', 'createdFiles', 'modifiedFiles', 'deletedFiles'];
const DEFAULT_IMPORT_STATS_PERIOD = 'minute';

export default Service.extend({
  onepanelServer: service(),

  /**
   * State of global `spacesBatchResolver` to use globally in application.
   * It must be initialized first which is done by using `getSpacesBatchResolver` method.
   * @type {PromiseObject<Utils.BatchResolver>}
   */
  spacesBatchResolverProxy: undefined,

  isSpacesCacheInitialized: bool('spacesBatchResolverProxy'),

  /**
   * Global cache of loaded spaces.
   * @type {ComputedProperty<PromiseUpdatedObject<Array<PromiseUpdatedObject<SpaceDetails>>>>}
   */
  spacesCache: computed(
    'spacesBatchResolverProxy.content.promise',
    function spacesCache() {
      const spacePromiseObjectsArrayPromise = (async () => {
        const spacesBatchResolver = await this.getSpacesBatchResolver(false);
        const spaces = await spacesBatchResolver.promise;
        return spaces.map((space) =>
          PromiseUpdatedObject.create({ promise: resolve(space) })
        );
      })();

      return PromiseUpdatedObject.create({
        promise: spacePromiseObjectsArrayPromise,
      });
    }
  ),

  reportsCache: Object.freeze({}),

  /**
   * @type {Utils.BatchResolver}
   */
  spacesBatchResolver: null,

  init() {
    this._super(...arguments);
    this.set('reportsCache', {});
    this.set('spacesBatchResolverProxy', PromiseObject.create());
  },

  /**
   * @param {boolean} reload if true, force request to server even if there is cache
   * @returns {PromiseObject<Utils.BatchResolver>}
   */
  async getSpacesBatchResolver(reload = true) {
    let batchResolverPromise;
    if (reload || !get(this.spacesBatchResolverProxy, 'content')) {
      batchResolverPromise = this._resolveSpacesBatchResolver();
      this.spacesBatchResolverProxy.set('promise', batchResolverPromise);
    }
    return this.spacesBatchResolverProxy;
  },

  /**
   * The batch resolver will resolve array of `OnepanelGui.SpaceDetails`.
   * @returns {Utils.BatchResolver}
   */
  async _resolveSpacesBatchResolver() {
    const providerSpacesData = await this.onepanelServer
      .requestValidData(
        'SpaceSupportApi',
        'getProviderSpaces'
      );
    const ids = providerSpacesData.data.ids;
    const fetchFunctions = ids.map((id) =>
      async () => {
        try {
          return await this._getSpaceDetails(id);
        } catch (error) {
          // TODO: VFS-11005 Handle single load errors or remove this code
          return SpaceDetails.create({
            name: '<error>',
            supportingProviders: {},
            isRejected: true,
          });
        }
      }
    );
    const batchResolver = BatchResolver.create({
      promiseFunctions: fetchFunctions,
      chunkSize: 20,
    });
    batchResolver.allFulfilled();
    return batchResolver;
  },

  /**
   * Update record inside created spaces collection
   * Requires former usage of `getSpacesBatchResolver`!
   * @param {string} spaceId space with this ID will be updated
   * @returns {Promise<OnepanelGui.SpaceDetails>}
   */
  async updateSpaceDetailsCache(spaceId) {
    /** @type {Array<PromiseUpdatedObject<SpaceDetails>>} */
    const cacheArray = await this.spacesCache;
    if (!cacheArray) {
      return;
    }
    /** @type {PromiseUpdatedObject<SpaceDetails>} */
    const spaceProxy = cacheArray.find(space => get(space, 'content.id') === spaceId);
    if (!spaceProxy) {
      return;
    }
    const cachedSpace = get(spaceProxy, 'content');
    const promise = this._getSpaceDetails(spaceId)
      .then(freshSpaceDetails => {
        return emberObjectReplace(cachedSpace, freshSpaceDetails);
      });
    set(spaceProxy, 'promise', promise);
    return await promise;
  },

  /**
   * Fetch details of space support with given ID
   *
   * @param {string} id
   * @returns {PromiseUpdatedObject<SpaceDetails>}
   */
  getSpaceDetails(id) {
    if (this.isSpacesCacheInitialized) {
      const spacePromiseObjectResolver = (async () => {
        const spacesCache = await this.spacesCache;
        const cachedSpace = spacesCache.find(spacePromiseObject =>
          get(spacePromiseObject, 'id') === id
        );
        return cachedSpace ?? this._getSpaceDetails(id);
      })();
      return PromiseUpdatedObject.create({ promise: spacePromiseObjectResolver });
    } else {
      return PromiseUpdatedObject.create({ promise: this._getSpaceDetails(id) });
    }
  },

  /**
   * Fetch and create _new_ OnepanelGui.SpaceDetails object
   * @param {string} id
   * @returns {Promise<OnepanelGui.SpaceDetails>}
   */
  _getSpaceDetails(id) {
    return this.get('onepanelServer').requestValidData(
      'SpaceSupportApi',
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
    const onepanelServer = this.get('onepanelServer');
    return onepanelServer
      .request('SpaceSupportApi', 'modifySpace', id, spaceData)
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
    const onepanelServer = this.get('onepanelServer');
    const supportReq = SpaceSupportRequest.constructFromObject(supportSpaceData);
    return onepanelServer.request('SpaceSupportApi', 'supportSpace', supportReq);
  },

  /**
   * Fetch current import info
   *
   * @param {String} spaceId
   * @returns {Promise<Onepanel.AutoStorageImportInfo>}
   */
  getImportInfo(spaceId) {
    return this.get('onepanelServer').request(
      'StorageImportApi',
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
      'StorageImportApi',
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
      'StorageImportApi',
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
      'AutoCleaningApi',
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
      'AutoCleaningApi',
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
        'AutoCleaningApi',
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
      'AutoCleaningApi',
      'triggerAutoCleaning',
      spaceId,
    ).then(({ data }) => data);
  },

  stopCleaning(spaceId) {
    return this.get('onepanelServer').request(
      'AutoCleaningApi',
      'cancelAutoCleaning',
      spaceId,
    ).then(({ data }) => data);
  },

  /**
   * @param {String} spaceId
   * @returns {Promise}
   */
  stopImportScan(spaceId) {
    return this.get('onepanelServer').request(
      'StorageImportApi',
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
      'StorageImportApi',
      'forceStartAutoStorageImportScan',
      spaceId,
    );
  },
});
