// FIXME this file is too big - use mixins

/**
 * Details about support provided for space
 *
 * @module components/cluster-spaces-table-item.js
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import { invokeAction } from 'ember-invoke-action';
import _includes from 'lodash/includes';
import Looper from 'onepanel-gui/utils/looper';

const {
  Component,
  computed,
  computed: { readOnly },
  get,
  set,
  inject: { service },
  observer,
  on,
} = Ember;

/**
 * Space's ``storageImport`` properties that shouldn't be listed as generic
 * properties (can be handled separately)
 * @type {Array.string}
 */
const SKIPPED_IMPORT_PROPERTIES = ['strategy'];

/**
 * Space's ``storageUpdate`` properties that shouldn't be listed as generic
 * properties (can be handled separately)
 * @type {Array.string}
 */
const SKIPPED_UPDATE_PROPERTIES = ['strategy'];

const WATCHER_INTERVAL = {
  minute: 5000 + 1,
  hour: 60 * 60000 + 1,
  day: 24 * 60000 + 1,
};

const SYNC_STATS_REFRESH_TIME = 10000;

export default Component.extend({
  classNames: ['cluster-spaces-table-item'],

  storageManager: service(),
  spaceManager: service(),

  /**
   * OneCollapsibleListItem that should be used to render this
   * To inject.
   * @type {Component.OneCollapsibleListItem}
   */
  listItem: null,

  /**
   * @type {SpaceDetails}
   */
  space: null,

  /**
   * Storage that supports space on this panel's provider
   * @type {ObjectPromiseProxy}
   */
  _storage: null,

  /**
   * If true, space revoke modal is opened
   * @type {boolean}
   */
  _openRevokeModal: false,

  // FIXME this should be computed from   
  /**
   * Maximal time [ms] after which ``_syncStatus`` should be updated (fetched)
   * @type {number}
   */
  _syncStatusRefreshTime: SYNC_STATS_REFRESH_TIME,

  /**
   * @type {Date}
   */
  _lastSyncStatusRefresh: null,
  /**
   * Currently chosen sync interval (enum as in SpaceSyncStats)
   * @type {string}
   */
  _syncInterval: 'minute',

  /**
   * Periodically fetched new sync statistics (for charts)
   *
   * It's interval is reconfigured in ``reconfigureWatcher`` observer
   * by various changes
   *
   * @type {Looper}
   */
  _syncStatsWatcher: null,

  /**
   * Periodically checks if sync status if fresh and if not - fetch sync status
   * (without statistics)
   * 
   * @type {Looper}
   */
  _syncStatusUpdater: null,

  _importActive: readOnly('space.importEnabled'),

  _isActive: readOnly('listItem.isActive'),

  _importButtonActionName: computed('importConfigurationOpen', function () {
    return this.get('importConfigurationOpen') ?
      'endImportConfiguration' :
      'startImportConfiguration';
  }),

  // TODO i18n
  _importButtonTip: computed('importConfigurationOpen', function () {
    return this.get('importConfigurationOpen') ?
      'Cancel sync. configuration' : 'Configure data synchronization';
  }),

  /**
   * @type {Onepanel.SpaceSyncStats}
   */
  _syncStats: null,

  importTranslationPrefix: 'components.clusterSpacesTableItem.storageImport.',
  updateTranslationPrefix: 'components.clusterSpacesTableItem.storageUpdate.',

  importStrategyLabel: computed('space.storageImport.strategy', function () {
    let i18n = this.get('i18n');
    let importTranslationPrefix = this.get('importTranslationPrefix');
    let strategy = this.get('space.storageImport.strategy');
    return i18n.t(`${importTranslationPrefix}strategies.${strategy}`);
  }),

  updateStrategyLabel: computed('space.storageUpdate.strategy', function () {
    let i18n = this.get('i18n');
    let updateTranslationPrefix = this.get('updateTranslationPrefix');
    let strategy = this.get('space.storageUpdate.strategy');
    return i18n.t(`${updateTranslationPrefix}strategies.${strategy}`);
  }),

  /**
   * List of specific non-empty, type-specific storage import properties
   * @type {Array}
   */
  importProperties: computed('space.storageImport', 'space.content', function () {
    let space = this.get('space');
    // support for ObjectProxy
    if (space != null && space.content != null) {
      space = space.get('content');
    }
    let storageImport = get(space, 'storageImport');
    return storageImport != null ?
      Object.keys(storageImport).filter(p =>
        get(storageImport, p) != null && !_includes(SKIPPED_IMPORT_PROPERTIES, p)
      ) : [];
  }),

  /**
   * List of specific non-empty, type-specific storage update properties
   * @type {Array}
   */
  updateProperties: computed('space.storageUpdate', 'space.content', function () {
    let space = this.get('space');
    // support for ObjectProxy
    if (space != null && space.content != null) {
      space = space.get('content');
    }
    let storageUpdate = get(space, 'storageUpdate');
    return storageUpdate != null ?
      Object.keys(storageUpdate).filter(p =>
        get(storageUpdate, p) != null && !_includes(SKIPPED_UPDATE_PROPERTIES, p)
      ) : [];
  }),

  importFormDefaultValue: computed('space', function () {
    let space = this.get('space');
    // support for ObjectProxy
    if (space != null && space.content != null) {
      space = space.content;
    }
    return space;
  }),

  init() {
    this._super(...arguments);
    let space = this.get('space');
    if (space) {
      let storageManager = this.get('storageManager');
      this.set('_storage', storageManager.getStorageDetails(space.get('storageId')));
    }

    let _syncStatsWatcher = Looper.create({ immediate: true });
    _syncStatsWatcher.on('tick', this._fetchAllSyncStats.bind(this));
    _syncStatsWatcher.notify();

    let _syncStatusUpdater = Looper.create({
      immediate: true,
      interval: SYNC_STATS_REFRESH_TIME,
    });
    _syncStatusUpdater.on('tick', this._checkSyncStatusUpdate.bind(this));
    _syncStatusUpdater.notify();

    this.setProperties({ _syncStatsWatcher, _syncStatusUpdater });
  },

  willDestroyElement() {
    this.get('_syncStatsWatcher').stop();
    this.get('_syncStatusUpdater').stop();
  },

  /**
   * @returns {boolean} true if sync status should be refreshed
   */
  _shouldRefreshSyncStatus() {
    let {
      _syncStatusRefreshTime,
      _lastSyncStatusRefresh,
    } = this.getProperties(
      '_syncStatusRefreshTime',
      '_lastSyncStatusRefresh'
    );

    return Date.now() - _lastSyncStatusRefresh > _syncStatusRefreshTime;
  },

  /**
   * If sync status was now updated for some mininal time, fetch sync status
   */
  _checkSyncStatusUpdate() {
    if (this._shouldRefreshSyncStatus()) {
      let syncStatsPromise =
        this.get('spaceManager').getSyncStatusOnly(this.get('space.id'));

      syncStatsPromise.then(newSyncStats => {
        this._updateSyncStatsWithStatusOnly(newSyncStats);
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
  _updateSyncStatsWithStatusOnly(newSyncStats) {
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

  _fetchAllSyncStats() {
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

  reconfigureWatcher: on('init', observer('_isActive', '_importActive', '_syncInterval',
    '_syncStatsWatcher',
    function () {
      let {
        _isActive,
        _importActive,
        _syncInterval,
        _syncStatsWatcher
      } = this.getProperties(
        '_isActive',
        '_importActive',
        '_syncInterval',
        '_syncStatsWatcher'
      );

      if (_importActive && _isActive) {
        _syncStatsWatcher.set('interval', WATCHER_INTERVAL[_syncInterval]);
      } else {
        _syncStatsWatcher.stop();
      }
    })),

  actions: {
    startRevoke() {
      this.set('_openRevokeModal', true);
    },
    hideRevoke() {
      this.set('_openRevokeModal', false);
    },
    revokeSpace() {
      return invokeAction(this, 'revokeSpace', this.get('space'));
    },
    startImportConfiguration(toggleAction) {
      this.set('importConfigurationOpen', true);
      toggleAction.call(null, true);
    },
    endImportConfiguration() {
      this.set('importConfigurationOpen', false);
    },
    importUpdateConfigurationSubmit(configuration) {
      return invokeAction(this, 'submitModifySpace', configuration);
    },
  },
});
