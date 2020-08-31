/**
 * Adds storage import statistics fetch capabilities to `cluster-spaces-table-item`
 *
 * @module mixins/storage-import-import-stats
 * @author Jakub Liput
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Mixin from '@ember/object/mixin';
import { inject as service } from '@ember/service';
import { computed, observer, get, getProperties } from '@ember/object';
import { readOnly, equal, not } from '@ember/object/computed';
import _ from 'lodash';
import moment from 'moment';
import Looper from 'onedata-gui-common/utils/looper';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

/**
 * How often watchers should sample for stats for given metrics [ms]
 */
const WATCHER_INTERVAL = {
  minute: 5000 + 1,
  hour: 1 * 60 * 1000 + 1,
  day: 10 * 60 * 1000 + 1,
};

/**
 * Default max time after which watchers should fetch at least import statuses [ms]
 */
const IMPORT_STATUS_REFRESH_TIME = 15000;

export default Mixin.create({
  spaceManager: service(),

  /**
   * Import statistics object fetched from backend
   *
   * This property is updated automatically by some interval watchers
   *
   * @type {Onepanel.AutoStorageImportStats}
   */
  _importStats: null,

  // TODO maybe this could be computed from import/update algorightm's loop period
  /**
   * Maximal time [ms] after which ``_importStatus`` should be updated (fetched)
   * @type {number}
   */
  importStatusRefreshTime: IMPORT_STATUS_REFRESH_TIME,

  /**
   * Currently chosen import interval (enum as in AutoStorageImportStats: minute, hour or day)
   * @type {string}
   */
  importInterval: 'minute',

  /**
   * Previous value of importInterval used to detect changes
   */
  _prevImportInterval: null,

  hideImportStats: equal('importInterval', null),
  showImportStats: not('hideImportStats'),

  /**
   * When the import status was updated last time?
   * @type {Date}
   */
  _lastImportStatusRefresh: null,

  /**
   * Periodically fetched new import statistics (for charts)
   *
   * It's interval is reconfigured in ``reconfigureImportWatchers`` observer
   * by various changes
   *
   * Initialized on init
   *
   * @type {Looper}
   */
  _importChartStatsWatcher: null,

  /**
   * Periodically checks if import status if fresh and if not - fetch import status
   * (without statistics)
   *
   * Initialized on init
   * 
   * @type {Looper}
   */
  _importStatusWatcher: null,

  timeStatsCollection: readOnly('_importStats.stats'),

  /**
   * TimeStatsCollection in form of Array
   */
  timeStats: computed('timeStatsCollection', function () {
    return _.values(this.get('timeStatsCollection'));
  }).readOnly(),

  /**
   * Latest ``lastValueDate`` from all import stats.
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
   * True if time stats have been loaded after importInterval change
   * at least once.
   * @type {boolean}
   */
  timeStatsLoading: true,

  init() {
    this._super(...arguments);

    // interval of this Looper will be set in reconfigureImportWatchers observer
    let _importChartStatsWatcher = Looper.create({ immediate: true });
    _importChartStatsWatcher.on('tick', () =>
      safeExec(this, 'fetchAllImportStats')
    );

    let _importStatusWatcher = Looper.create({
      immediate: true,
      interval: this.get('importStatusRefreshTime'),
    });
    _importStatusWatcher.on('tick', () =>
      safeExec(this, 'checkImportStatusUpdate')
    );
    this.checkImportStatusUpdate();

    this.setProperties({ _importChartStatsWatcher, _importStatusWatcher });

    this.reconfigureImportWatchers();
  },

  willDestroyElement() {
    try {
      this.get('_importChartStatsWatcher').stop();
      this.get('_importStatusWatcher').stop();
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * @returns {boolean} true if import status should be refreshed
   */
  shouldRefreshImportStatus() {
    let {
      importStatusRefreshTime,
      _lastImportStatusRefresh,
      autoImportActive,
    } = this.getProperties(
      'importStatusRefreshTime',
      '_lastImportStatusRefresh',
      'autoImportActive'
    );

    return autoImportActive &&
      Date.now() - _lastImportStatusRefresh > importStatusRefreshTime;
  },

  /**
   * If import status was not updated for some mininal time, fetch import status
   * @returns {undefined}
   */
  checkImportStatusUpdate() {
    if (this.shouldRefreshImportStatus()) {
      this.fetchStatusImportStats();
    }
  },

  /**
   * @param {Onepanel.AutoStorageImportStats} newImportStats importStats without time stats
   * @returns {undefined}
   */
  updateImportStatsWithStatusOnly(newImportStats) {
    safeExec(this, 'set', '_importStats', Object.assign({},
      this.get('_importStats') || {}, getProperties(newImportStats, 'status', 'nextScan')
    ));
  },

  fetchStatusImportStats() {
    let importStatsPromise =
      this.get('spaceManager').getImportStatusOnly(this.get('space.id'));

    importStatsPromise.then(newImportStats => {
      this.updateImportStatsWithStatusOnly(newImportStats);
    });

    importStatsPromise.finally(() => {
      this.set('_lastImportStatusRefresh', Date.now());
    });

    // TODO status fetch error handling
  },

  fetchAllImportStats() {
    const {
      importInterval,
      spaceManager,
    } = this.getProperties('importInterval', 'spaceManager');
    const spaceId = this.get('space.id');

    return spaceManager.getImportAllStats(spaceId, importInterval)
      .then(newImportStats => safeExec(this, () => this.setProperties({
        lastStatsUpdateTime: Date.now(),
        _importStats: newImportStats,
        timeStatsError: null,
      })))
      .catch(error => safeExec(this, () => this.set('timeStatsError', error)))
      .finally(() => safeExec(this, () => this.setProperties({
        timeStatsLoading: false,
        _lastImportStatusRefresh: Date.now(),
      })));
  },

  /**
   * Is import tab currently opened
   * NOTE: selectedTab is provided by `space-tabs` mixin
   * @type {Ember.ComputedProperty<boolean>}
   */
  importTabActive: computed('selectedTab', function () {
    const selectedTab = this.get('selectedTab');
    return selectedTab && selectedTab === 'import';
  }),

  reconfigureImportWatchers: observer(
    'autoImportActive',
    'importInterval',
    '_importChartStatsWatcher',
    'importTabActive',
    function () {
      const {
        autoImportActive,
        importInterval,
        _importChartStatsWatcher,
        _importStatusWatcher,
        importStatusRefreshTime,
        importTabActive,
      } = this.getProperties(
        'autoImportActive',
        'importInterval',
        '_importChartStatsWatcher',
        '_importStatusWatcher',
        'importStatusRefreshTime',
        'importTabActive',
      );

      if (autoImportActive) {
        _importStatusWatcher.set('interval', importStatusRefreshTime);
      }

      if (importTabActive && autoImportActive) {
        _importChartStatsWatcher.set('interval', WATCHER_INTERVAL[importInterval]);
      } else {
        _importChartStatsWatcher.stop();
      }
    }),

  actions: {
    /**
     * @param {string} importInterval one of: minute, hour, day
     * @returns {undefined}
     */
    onimportIntervalChange(importInterval) {
      let currentimportInterval = this.get('importInterval');
      if (importInterval !== currentimportInterval) {
        this.set('_importStats.stats', undefined);
        this.setProperties({
          importInterval,
          _prevImportInterval: currentimportInterval,
          timeStatsLoading: true,
          timeStatsError: null,
        });
      }
    },
  },
});
