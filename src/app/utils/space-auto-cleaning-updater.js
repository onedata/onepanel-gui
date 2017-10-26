/**
 * A class for creating object that polls for auto cleaning status and reports
 * To use in space auto cleaning components (`component:space-auto-cleaning`)
 *
 * @module utils/space-auto-cleaning-updater
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { default as EmberObject, computed } from '@ember/object';
import { get, set, observer, getProperties } from '@ember/object';
import { run } from '@ember/runloop';
import { assert } from '@ember/debug';
import { A } from '@ember/array';
import { isEmpty } from '@ember/utils';
import moment from 'moment';
import _ from 'lodash';

const IDLE_UPDATE_INTERVAL = 10 * 1000;
const WORKING_UPDATE_INTERVAL = 5 * 1000;

import Looper from 'onedata-gui-common/utils/looper';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import pushNewItems from 'onedata-gui-common/utils/push-new-items';

export default EmberObject.extend({
  /**
   * @virtual
   * @type {Ember.Service} SpaceManager service
   */
  spaceManager: undefined,

  /**
   * @virtual
   * @type {string}
   */
  spaceId: undefined,

  /**
   * After init, update is disabled by default
   * @virtual
   * @type {boolean}
   */
  isEnabled: false,

  /**
   * Collection of cleaning reports
   * Updated by polling
   * @type {Onepanel.AutoCleaningStatus}
   */
  status: undefined,

  /**
   * Collection of cleaning reports
   * Updated by polling
   * @type {EmberArray<Onepanel.SpaceAutoCleaningReport>}
   */
  reports: undefined,

  /**
   * Initialized with `_createCleanWatchers`
   * @type {Looper}
   */
  _cleanStatusWatcher: undefined,

  /**
   * Initialized with `_createCleanWatchers`
   * @type {Looper}
   */
  _cleanReportsWatcher: undefined,

  /**
   * It true, currently fetching reports from backend
   * Set by some interval watcher
   * @type {boolean}
   */
  cleanStatusIsUpdating: undefined,

  /**
   * It true, currently fetching reports from backend
   * Set by some interval watcher
   * @type {boolean}
   */
  cleanReportsIsUpdating: undefined,

  /**
   * Error object from fetching status rejection
   * @type {any} typically a request error object
   */
  cleanStatusError: null,

  /**
   * Error object from fetching reports rejection
   * @type {any} typically a request error object
   */
  cleanReportsError: null,

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  inProgress: computed.equal('status.inProgress', true),

  /**
   * @type {number}
   */
  _sharedInterval: computed('isEnabled', 'inProgress', function () {
    if (this.get('isEnabled')) {
      if (this.get('inProgress')) {
        return WORKING_UPDATE_INTERVAL;
      } else {
        return IDLE_UPDATE_INTERVAL;
      }
    } else {
      return null;
    }
  }),

  /**
   * Interval [ms] used by `_cleanStatusWatcher`
   * @type {number}
   */
  _cleanStatusInterval: computed.reads('_sharedInterval'),

  /**
   * Interval [ms] used by `_cleanReportsWatcher`
   * @type {number}
   */
  _cleanReportsInterval: computed.reads('_sharedInterval'),

  /**
   * True if loading status for the first time after init
   * @type {Ember.ComputedProperty<boolean>}
   */
  cleanStatusIsInitializing: computed(
    'status',
    'cleanStatusIsUpdating',
    function () {
      return this.get('cleanStatusIsUpdating') && this.get('status') == null;
    }
  ).readOnly(),

  /**
   * True if loading reports for the first time after init
   * @type {Ember.ComputedProperty<boolean>}
   */
  cleanReportsIsInitializing: computed(
    'reports',
    'cleanReportsIsUpdating',
    function () {
      return this.get('cleanReportsIsUpdating') && this.get('reports') == null;
    }
  ).readOnly(),

  /**
   * @type {Ember.ComputedProperty<Moment>}
   */
  _cleanReportsFetchMoment: computed('_lastReportMoment', function () {
    return this.get('_lastReportMoment') || defaultReportsFetchMoment();
  }).readOnly(),

  /**
   * Last event time for reports, can be eg. `stoppedAt` moment of last recent
   * report, but also can be a `startedAt` of a report in progress
   * @type {Ember.ComputedProperty<Moment|null>}
   */
  _lastReportMoment: computed('reports.@each.{startedAt,stoppedAt}', function () {
    const reports = this.get('reports');
    let reportMoment;
    if (!isEmpty(reports)) {
      if (reports.length > 1) {
        const reportMoments = _.map(reports, report => {
          const stoppedAt = get(report, 'stoppedAt');
          return stoppedAt && moment(stoppedAt);
        });
        reportMoment = _.max(reportMoments);
      } else if (reports.length === 1) {
        const {
          startedAt,
          stoppedAt,
        } = getProperties(reports[0], 'startedAt', 'stoppedAt');
        reportMoment = stoppedAt && moment(stoppedAt) ||
          startedAt && moment(startedAt);
      }

      return reportMoment && reportMoment.subtract(1, 's');
    }
  }),

  init() {
    this._super(...arguments);
    const {
      spaceManager,
      spaceId,
    } = this.getProperties('spaceManager', 'spaceId');

    // initialize empty reports collection
    this.set('reports', A([]));

    assert(typeof spaceManager !== 'object',
      'spaceManager service should be injected');
    assert(typeof spaceId !==
      'string', 'spaceId should be injected');

    this.setProperties({
      cleanStatusIsUpdating: true,
      cleanReportsIsUpdating: true,
    });

    this._createCleanWatchers();
    this._reconfigureCleanWatchers();

    // get properties to enable observers
    this.getProperties('_cleanStatusInterval', '_cleanReportsInterval');
  },

  destroy() {
    try {
      this.setProperties({
        _cleanStatusInterval: undefined,
        _cleanReportsInterval: undefined,
      });
      _.each(
        _.values(this.getProperties('_cleanStatusWatcher', '_cleanReportsWatcher')),
        watcher => watcher.destroy()
      );
    } finally {
      this._super(...arguments);
    }
  },

  _reconfigureCleanWatchers: observer(
    '_cleanStatusInterval',
    '_cleanReportsInterval',
    function () {
      // debouncing does not let _setCleanWatchersIntervals to be executed multiple
      // times, which can occur for observer
      run.debounce(this, '_setCleanWatchersIntervals', 1);
    }
  ),

  // TODO: there should be no watcher for reports at all - it should be updated:
  // - after enabling
  // - on change status.inProgress true -> false

  /**
   * Create watchers for fetching information space cleaning
   */
  _createCleanWatchers() {
    const _cleanStatusWatcher = Looper.create({
      immediate: true,
    });
    _cleanStatusWatcher
      .on('tick', () =>
        safeExec(this, 'fetchCleanStatus')
      );

    const _cleanReportsWatcher = Looper.create({
      immediate: true,
    });
    _cleanReportsWatcher
      .on('tick', () =>
        safeExec(this, 'fetchCleanReports')
      );

    this.setProperties({
      _cleanReportsWatcher,
      _cleanStatusWatcher,
    });
  },

  _setCleanWatchersIntervals() {
    // this method is invoked from debounce, so it's this can be destroyed
    if (this.isDestroyed === false) {
      const {
        _cleanStatusInterval,
        _cleanReportsInterval,
        _cleanStatusWatcher,
        _cleanReportsWatcher,
      } = this.getProperties(
        '_cleanStatusInterval',
        '_cleanReportsInterval',
        '_cleanStatusWatcher',
        '_cleanReportsWatcher',
      );
      set(_cleanStatusWatcher, 'interval', _cleanStatusInterval);
      set(_cleanReportsWatcher, 'interval', _cleanReportsInterval);
    }
  },

  fetchCleanStatus() {
    const {
      spaceManager,
      spaceId,
    } = this.getProperties('spaceManager', 'spaceId');
    this.set('cleanStatusIsUpdating', true);
    return spaceManager.getAutoCleaningStatus(spaceId)
      .then(autoCleaningStatus => {
        this.set('cleanStatusError', null);
        return this.set('status', autoCleaningStatus);
      })
      .catch(error => this.set('cleanStatusError', error))
      .finally(() => this.set('cleanStatusIsUpdating', false));
  },

  fetchCleanReports() {
    const {
      spaceManager,
      spaceId,
      _cleanReportsFetchMoment,
    } = this.getProperties('spaceManager', 'spaceId', '_cleanReportsFetchMoment');
    const startedAfter = _cleanReportsFetchMoment.toISOString();
    this.set('cleanReportsIsUpdating', true);
    return spaceManager.getAutoCleaningReports(spaceId, startedAfter)
      .then(({ reportEntries }) => safeExec(this, function () {
        this.set('cleanReportsError', null);
        return pushNewItems(
          this.get('reports'),
          reportEntries,
          (x, y) => x.startedAt === y.startedAt
        );
      }))
      .catch(error => safeExec(this, function () {
        this.set('cleanReportsError', error);
      }))
      .finally(() => safeExec(this, function () {
        this.set('cleanReportsIsUpdating', false);
      }));
  },

});

/**
 * If there is no information about last cleaning event,
 * we should fetch reports that started after this Moment
 * @returns {Moment}
 */
function defaultReportsFetchMoment() {
  return moment().subtract(1, 'day');
}
