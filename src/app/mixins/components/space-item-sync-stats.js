import _ from 'lodash';
import moment from 'moment';

/**
 * Adds space sync statistics fetch capabilities to `cluster-spaces-table-item`
 *
 * @module mixins/space-item-sync-stats
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

import Looper from 'onedata-gui-common/utils/looper';
import safeMethodExecution from 'onedata-gui-common/utils/safe-method-execution';

const {
  Mixin,
  inject: { service },
  get,
  set,
  on,
  observer,
  computed,
  computed: { readOnly },
  isEmpty,
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

  /**
   * Sync statistics object fetched from backend
   *
   * This property is updated automatically by some interval watchers
   *
   * @virtual
   * @type {Onepanel.SpaceSyncStats}
   */
  _syncStats: null,

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
   * Previous value of syncInterval used to detect changes
   */
  _prevSyncInterval: null,

  hideSyncStats: computed.equal('syncInterval', null),
  showSyncStats: computed.not('hideSyncStats'),

  /**
   * When the sync status was updated last time?
   * @type {Date}
   */
  _lastSyncStatusRefresh: null,

  /**
   * Periodically fetched new sync statistics (for charts)
   *
   * It's interval is reconfigured in ``reconfigureSyncWatchers`` observer
   * by various changes
   *
   * Initialized on init
   *
   * @type {Looper}
   */
  _syncChartStatsWatcher: null,

  /**
   * Periodically checks if sync status if fresh and if not - fetch sync status
   * (without statistics)
   *
   * Initialized on init
   * 
   * @type {Looper}
   */
  _syncStatusWatcher: null,

  timeStatsCollection: readOnly('_syncStats.stats'),

  /**
   * TimeStatsCollection in form of Array
   */
  timeStats: computed('timeStatsCollection', function () {
    return _.values(this.get('timeStatsCollection'));
  }).readOnly(),

  /**
   * Latest ``lastValueDate`` from all sync stats.
   * @type {Date}
   */
  lastValueDate: computed('timeStats.@each.lastValueDate', function () {
    let timeStats = this.get('timeStats');
    if (timeStats) {
      return _.max(
        _.map(
          timeStats,
          ts => ts ? get(ts, 'lastValueDate') : undefined
        )
      );
    }
  }).readOnly(),

  lastValueDateText: computed('lastValueDate', function () {
    let lastValueDate = this.get('lastValueDate');
    return lastValueDate ?
      moment(lastValueDate).format('YYYY-MM-DD, HH:mm:ss') :
      undefined;
  }),

  /**
   * @type {string}
   */
  timeStatsError: null,

  /**
   * True if time stats have been loaded after syncInterval change
   * at least once.
   * @type {boolean}
   */
  timeStatsLoading: true,

  /**
   * If true, statistics are not updated live, but only archival ones are
   * presented. There should be also clear information about that.
   * It is set to true on full stats update when import is done (without update).
   * @type {boolean}
   */
  statsFrozen: false,

  init() {
    this._super(...arguments);

    // interval of this Looper will be set in reconfigureSyncWatchers observer
    let _syncChartStatsWatcher = Looper.create({ immediate: true });
    _syncChartStatsWatcher.on('tick', () => safeMethodExecution(this,
      'fetchAllSyncStats'));

    let _syncStatusWatcher = Looper.create({
      immediate: true,
      interval: this.get('syncStatusRefreshTime'),
    });
    _syncStatusWatcher.on('tick', () => safeMethodExecution(this,
      'checkSyncStatusUpdate'));
    this.checkSyncStatusUpdate();

    this.setProperties({ _syncChartStatsWatcher, _syncStatusWatcher });
  },

  willDestroyElement() {
    try {
      this.get('_syncChartStatsWatcher').stop();
      this.get('_syncStatusWatcher').stop();
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
      _importActive,
    } = this.getProperties(
      'syncStatusRefreshTime',
      '_lastSyncStatusRefresh',
      '_importActive'
    );

    return _importActive &&
      Date.now() - _lastSyncStatusRefresh > syncStatusRefreshTime;
  },

  /**
   * If sync status was not updated for some mininal time, fetch sync status
   * @returns {undefined}
   */
  checkSyncStatusUpdate() {
    if (this.shouldRefreshSyncStatus()) {
      this.fetchStatusSyncStats();
    }
  },

  /**
   * @param {Onepanel.SpaceSyncStats} newSyncStats syncStats without time stats
   * @returns {undefined}
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

  fetchStatusSyncStats() {
    let syncStatsPromise =
      this.get('spaceManager').getSyncStatusOnly(this.get('space.id'));

    syncStatsPromise.then(newSyncStats => {
      this.updateSyncStatsWithStatusOnly(newSyncStats);
    });

    syncStatsPromise.finally(() => {
      this.set('_lastSyncStatusRefresh', Date.now());
    });

    // TODO status fetch error handling
  },

  fetchAllSyncStats() {
    let syncInterval = this.get('syncInterval');

    let syncStatsPromise =
      this.get('spaceManager').getSyncAllStats(
        this.get('space.id'),
        syncInterval
      );

    syncStatsPromise.then(newSyncStats => {
      if (newSyncStats &&
        this.get('space.updateEnabled') === false &&
        !isEmpty(get(newSyncStats, 'stats')) &&
        this.get('space.importEnabled') &&
        get(newSyncStats, 'importStatus') === 'done') {

        this.set('statsFrozen', true);
      }

      this.setProperties({
        lastStatsUpdateTime: Date.now(),
        _syncStats: newSyncStats,
        timeStatsError: null,
      });
    });

    syncStatsPromise.catch(error => {
      this.setProperties({
        timeStatsError: error,
      });
    });

    syncStatsPromise.finally(() => {
      this.setProperties({
        timeStatsLoading: false,
        _lastSyncStatusRefresh: Date.now(),
      });
    });
  },

  reconfigureSyncWatchers: on('init',
    observer(
      '_isActive',
      '_importActive',
      'syncInterval',
      '_syncChartStatsWatcher',
      'statsFrozen',
      function () {
        let {
          _isActive,
          _importActive,
          syncInterval,
          _syncChartStatsWatcher,
          _syncStatusWatcher,
          statsFrozen,
          syncStatusRefreshTime,
        } = this.getProperties(
          '_isActive',
          '_importActive',
          'syncInterval',
          '_syncChartStatsWatcher',
          '_syncStatusWatcher',
          'statsFrozen',
          'syncStatusRefreshTime'
        );

        if (_importActive) {
          _syncStatusWatcher.set('interval', syncStatusRefreshTime);
        }

        if (_importActive && _isActive && !statsFrozen) {
          _syncChartStatsWatcher.set('interval', WATCHER_INTERVAL[syncInterval]);
        } else {
          _syncChartStatsWatcher.stop();
        }
      })),

  actions: {
    /**
     * @param {string} syncInterval one of: minute, hour, day
     * @returns {undefined}
     */
    onSyncIntervalChange(syncInterval) {
      let currentSyncInterval = this.get('syncInterval');
      if (syncInterval !== currentSyncInterval) {
        this.set('_syncStats.stats', undefined);
        this.setProperties({
          syncInterval,
          _prevSyncInterval: currentSyncInterval,
          timeStatsLoading: true,
          timeStatsError: null,
          statsFrozen: false,
        });
      }
    },
  },
});
