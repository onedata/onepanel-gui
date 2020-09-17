/**
 * Adds storage import statistics fetch capabilities to `cluster-spaces-table-item`
 *
 * @module mixins/space-item-import-stats
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Mixin from '@ember/object/mixin';
import { inject as service } from '@ember/service';
import { computed, observer, get } from '@ember/object';
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
const IMPORT_STATUS_REFRESH_TIME = 5000;

export default Mixin.create({
  spaceManager: service(),

  /**
   * Import info object fetched from backend
   *
   * This property is updated automatically by some interval watchers
   *
   * @type {Onepanel.AutoStorageImportInfo}
   */
  importInfo: null,

  /**
   * Import statistics object fetched from backend
   *
   * This property is updated automatically by some interval watchers
   *
   * @type {Onepanel.AutoStorageImportStats}
   */
  importStats: null,

  // TODO maybe this could be computed from import/update algorightm's loop period
  /**
   * Maximal time [ms] after which `importInfo` should be updated (fetched)
   * @type {number}
   */
  importInfoRefreshTime: IMPORT_STATUS_REFRESH_TIME,

  /**
   * Currently chosen import interval (enum as in AutoStorageImportStats: minute, hour or day)
   * @type {string}
   */
  importInterval: 'minute',

  /**
   * When the import status was updated last time?
   * @type {Date}
   */
  lastImportInfoRefresh: null,

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
  importChartStatsWatcher: null,

  /**
   * Periodically checks if import status if fresh and if not - fetch import status
   * (without statistics)
   *
   * Initialized on init
   * 
   * @type {Looper}
   */
  importInfoWatcher: null,

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

  /**
   * importStats in form of Array
   */
  timeStats: computed('importStats', function timeStats() {
    const importStats = this.get('importStats');
    return Object.keys(this.get('importStats') || {}).reduce((arr, key) => {
      arr.push(Object.assign({}, importStats[key], { name: key }));
      return arr;
    }, []);
  }).readOnly(),

  /**
   * Latest ``lastValueDate`` from all import stats.
   * @type {Date}
   */
  lastValueDate: computed('timeStats.@each.lastValueDate', function () {
    const timeStats = this.get('timeStats');
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
    const lastValueDate = this.get('lastValueDate');
    return lastValueDate ?
      moment(lastValueDate).format('YYYY-MM-DD, HH:mm:ss') :
      undefined;
  }),

  /**
   * Is import tab currently opened
   * NOTE: selectedTab is provided by `space-tabs` mixin
   * @type {Ember.ComputedProperty<boolean>}
   */
  importTabActive: computed('selectedTab', function importTabActive() {
    const selectedTab = this.get('selectedTab');
    return selectedTab && selectedTab === 'import';
  }),

  reconfigureImportWatchers: observer(
    'autoImportActive',
    'importInterval',
    'importChartStatsWatcher',
    'importInfoWatcher',
    'importInfoRefreshTime',
    'importTabActive',
    function () {
      const {
        autoImportActive,
        importInterval,
        importChartStatsWatcher,
        importInfoWatcher,
        importInfoRefreshTime,
        importTabActive,
      } = this.getProperties(
        'autoImportActive',
        'importInterval',
        'importChartStatsWatcher',
        'importInfoWatcher',
        'importInfoRefreshTime',
        'importTabActive',
      );

      if (autoImportActive) {
        importInfoWatcher.set('interval', importInfoRefreshTime);
      }

      if (importTabActive && autoImportActive) {
        importChartStatsWatcher.set('interval', WATCHER_INTERVAL[importInterval]);
      } else {
        importChartStatsWatcher.stop();
      }
    }
  ),

  init() {
    this._super(...arguments);

    // interval of this Looper will be set in reconfigureImportWatchers observer
    const importChartStatsWatcher = Looper.create({ immediate: true });
    importChartStatsWatcher.on('tick', () =>
      safeExec(this, 'fetchImportStats')
    );

    const importInfoWatcher = Looper.create({
      immediate: true,
      interval: this.get('importInfoRefreshTime'),
    });
    importInfoWatcher.on('tick', () =>
      safeExec(this, 'checkImportInfoUpdate')
    );
    this.checkImportInfoUpdate();

    this.setProperties({ importChartStatsWatcher, importInfoWatcher });

    this.reconfigureImportWatchers();
  },

  willDestroyElement() {
    try {
      this.get('importChartStatsWatcher').stop();
      this.get('importInfoWatcher').stop();
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * @returns {boolean} true if import info should be refreshed
   */
  shouldRefreshImportInfo() {
    const {
      importInfoRefreshTime,
      lastImportInfoRefresh,
      autoImportActive,
    } = this.getProperties(
      'importInfoRefreshTime',
      'lastImportInfoRefresh',
      'autoImportActive'
    );

    return autoImportActive &&
      Date.now() - lastImportInfoRefresh > importInfoRefreshTime;
  },

  /**
   * If import status was not updated for some mininal time, fetch import status
   * @returns {undefined}
   */
  checkImportInfoUpdate() {
    if (this.shouldRefreshImportInfo()) {
      this.fetchImportInfo();
    }
  },

  fetchImportInfo() {
    return this.get('spaceManager').getImportInfo(this.get('space.id'))
      .then(importInfo => {
        safeExec(this, 'set', 'importInfo', importInfo);
      })
      .finally(() => {
        safeExec(this, 'set', 'lastImportInfoRefresh', Date.now());
      });

    // TODO status fetch error handling
  },

  fetchImportStats() {
    const {
      importInterval,
      spaceManager,
    } = this.getProperties('importInterval', 'spaceManager');
    const spaceId = this.get('space.id');

    return spaceManager.getImportStats(spaceId, importInterval)
      .then(newImportStats => safeExec(this, () => this.setProperties({
        importStats: newImportStats,
        timeStatsError: null,
      })))
      .catch(error => safeExec(this, () => this.set('timeStatsError', error)))
      .finally(() => safeExec(this, () => this.set('timeStatsLoading', false)));
  },

  actions: {
    /**
     * @param {string} importInterval one of: minute, hour, day
     * @returns {undefined}
     */
    onImportIntervalChange(importInterval) {
      const currentimportInterval = this.get('importInterval');
      if (importInterval !== currentimportInterval) {
        this.setProperties({
          importStats: null,
          importInterval,
          timeStatsLoading: true,
          timeStatsError: null,
        });
      }
    },
  },
});
