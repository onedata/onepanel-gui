/**
 * Adds space sync statistics fetch capabilities to ``cluster-spaces-table-item``
 *
 * @module mixins/space-item-sync-stats
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

import Looper from 'onepanel-gui/utils/looper';

const {
  Mixin,
  inject: { service },
  get,
  set,
  on,
  observer,
} = Ember;

/**
 * How often watchers should sample for stats for given metrics [ms]
 */
const WATCHER_INTERVAL = {
  minute: 5000 + 1,
  hour: 60 * 60000 + 1,
  day: 24 * 60000 + 1,
};

/**
 * Default max time after which watchers should fetch at least sync statuses [ms]
 */
const SYNC_STATUS_REFRESH_TIME = 15000;

export default Mixin.create({
  spaceManager: service(),

  // TODO maybe this could be computed from import/update algorightm's loop period
  /**
   * Maximal time [ms] after which ``_syncStatus`` should be updated (fetched)
   * @type {number}
   */
  syncStatusRefreshTime: SYNC_STATUS_REFRESH_TIME,

  /**
   * Currently chosen sync interval (enum as in SpaceSyncStats: minute, hour or day)
   * @type {string}
   */
  syncInterval: 'minute',

  /**
   * When the sync status was updated last time?
   * @type {Date}
   */
  _lastSyncStatusRefresh: null,

  /**
   * Periodically fetched new sync statistics (for charts)
   *
   * It's interval is reconfigured in ``reconfigureWatcher`` observer
   * by various changes
   *
   * Initialized on init
   *
   * @type {Looper}
   */
  _syncStatsWatcher: null,

  /**
   * Periodically checks if sync status if fresh and if not - fetch sync status
   * (without statistics)
   *
   * Initialized on init
   * 
   * @type {Looper}
   */
  _syncStatusUpdater: null,

  /**
   * Sync statistics object fetched from backend
   *
   * This property is updated automatically by some interval watchers
   * @type {Onepanel.SpaceSyncStats}
   */
  _syncStats: null,

  init() {
    this._super(...arguments);

    let _syncStatsWatcher = Looper.create({ immediate: true });
    _syncStatsWatcher.on('tick', this.fetchAllSyncStats.bind(this));
    _syncStatsWatcher.notify();

    let _syncStatusUpdater = Looper.create({
      immediate: true,
      interval: this.get('syncStatusRefreshTime'),
    });
    _syncStatusUpdater.on('tick', this.checkSyncStatusUpdate.bind(this));
    _syncStatusUpdater.notify();

    this.setProperties({ _syncStatsWatcher, _syncStatusUpdater });
  },

  willDestroyElement() {
    try {
      this.get('_syncStatsWatcher').stop();
      this.get('_syncStatusUpdater').stop();
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * @returns {boolean} true if sync status should be refreshed
   */
  shouldRefreshSyncStatus() {
    let {
      syncStatusRefreshTime,
      _lastSyncStatusRefresh,
    } = this.getProperties(
      'syncStatusRefreshTime',
      '_lastSyncStatusRefresh'
    );

    return Date.now() - _lastSyncStatusRefresh > syncStatusRefreshTime;
  },

  /**
   * If sync status was not updated for some mininal time, fetch sync status
   */
  checkSyncStatusUpdate() {
    if (this.shouldRefreshSyncStatus()) {
      let syncStatsPromise =
        this.get('spaceManager').getSyncStatusOnly(this.get('space.id'));

      syncStatsPromise.then(newSyncStats => {
        this.updateSyncStatsWithStatusOnly(newSyncStats);
      });

      syncStatsPromise.finally(() => {
        this.set('_lastSyncStatusRefresh', Date.now());
      });

      // TODO status fetch error handling
    }
  },

  /**
   * @param {Onepanel.SpaceSyncStats} newSyncStats syncStats without time stats
   */
  updateSyncStatsWithStatusOnly(newSyncStats) {
    let currentSyncStats = this.get('_syncStats');
    if (currentSyncStats != null) {
      // we already got some syncStats so update only statuses
      set(currentSyncStats, 'importStatus', get(newSyncStats, 'importStatus'));
      set(currentSyncStats, 'updateStatus', get(newSyncStats, 'updateStatus'));
    } else {
      // first syncStats update
      this.set('_syncStats', newSyncStats);
    }
  },

  fetchAllSyncStats() {
    let syncStatsPromise =
      this.get('spaceManager').getSyncAllStats(this.get('space.id'));

    syncStatsPromise.then(newSyncStats => {
      this.set('_syncStats', newSyncStats);
    });

    syncStatsPromise.finally(() =>
      this.set('_lastSyncStatusRefresh', Date.now())
    );

    // TODO handle error
  },

  reconfigureWatcher: on('init', observer('_isActive', '_importActive', 'syncInterval',
    '_syncStatsWatcher',
    function () {
      let {
        _isActive,
        _importActive,
        syncInterval,
        _syncStatsWatcher
      } = this.getProperties(
        '_isActive',
        '_importActive',
        'syncInterval',
        '_syncStatsWatcher'
      );

      if (_importActive && _isActive) {
        _syncStatsWatcher.set('interval', WATCHER_INTERVAL[syncInterval]);
      } else {
        _syncStatsWatcher.stop();
      }
    })),
});
