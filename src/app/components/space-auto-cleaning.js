/**
 * A space auto cleaning tab with bar chart, file conditions form and 
 * cleaning reports table.
 *
 * @module components/space-auto-cleaning
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import EmberObject from '@ember/object';
import { computed, get, set, observer } from '@ember/object';
import { inject } from '@ember/service';
import { run } from '@ember/runloop';
import { Promise } from 'rsvp';
import moment from 'moment';
import _ from 'lodash';

const BLANK_AUTO_CLEANING = {
  enabled: false,
};

const DEFAULT_UPDATE_INTERVAL = 60 * 1000;

import Looper from 'onedata-gui-common/utils/looper';
import safeMethodExecution from 'onedata-gui-common/utils/safe-method-execution';

export default Component.extend({
  spaceManager: inject(),

  classNames: ['space-auto-cleaning'],

  /**
   * ID of SpaceDetails for which auto cleaning view is rendered
   * @virtual
   * @type {string}
   */
  spaceId: undefined,

  /**
   * Space size.
   * @virtual
   * @type {number}
   */
  spaceSize: 0,

  /**
   * @virtual
   * @type {Onepanel.AutoCleaning}
   */
  autoCleaning: undefined,

  /**
   * Action called on autocleaning settings change.
   * @virtual
   * @type {Function}
   */
  updateAutoCleaning: () => {},

  /**
   * Cleaning status
   * Updated by polling
   * @type {Onepanel.AutoCleaningStatus}
   */
  status: undefined,

  /**
   * Collectoion of cleaning reports
   * Updated by polling
   * @type {Array<Onepanel.SpaceAutoCleaningReport>}
   */
  reports: undefined,

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  _isEnabled: computed.readOnly('autoCleaning.enabled'),

  /**
   * Data for bar chart.
   * @type {Ember.ComputedProperty<Ember.Object>}
   */
  barData: computed(
    'autoCleaning.settings.{target,threshold}',
    'status.{isWorking,spaceUsed}',
    'spaceSize',
    function () {
      let {
        autoCleaning,
        status,
        spaceSize,
      } = this.getProperties('autoCleaning', 'status', 'spaceSize');
      return EmberObject.create({
        isWorking: get(status, 'isWorking'),
        spaceSize,
        spaceUsed: get(status, 'spaceUsed'),
        target: get(autoCleaning, 'settings.target'),
        threshold: get(autoCleaning, 'settings.threshold'),
      });
    }
  ),

  /**
   * Data for file conditions form.
   * @type {computed.Object}
   */
  conditionsFormData: computed(
    'autoCleaning.settings.{fileSizeGreaterThan,fileSizeLesserThan,fileTimeNotActive}',
    function () {
      let settings = this.get('autoCleaning.settings');
      return {
        fileSizeGreaterThan: get(settings, 'fileSizeGreaterThan'),
        fileSizeLesserThan: get(settings, 'fileSizeLesserThan'),
        fileTimeNotActive: get(settings, 'fileTimeNotActive'),
      };
    }
  ),

  init() {
    this._super(...arguments);
    // if the component is initialized with blank autoCleaning,
    // we should provide an empty valid autoCleaning
    if (this.get('autoCleaning') == null) {
      this.set('autoCleaning', BLANK_AUTO_CLEANING);
    }

    this.setProperties({
      _statusIsUpdating: true,
      _reportsIsUpdating: true,
    });

    this.createWatchers();
    this.reconfigureWatchers();

    // get properties to enable observers
    this.getProperties('_statusInterval', '_reportsInterval');
  },

  /// -- FIXME: decide these data functions should be here

  /**
   * Initialized with `createWatchers`
   * @type {Looper}
   */
  _statusWatcher: undefined,

  /**
   * Initialized with `createWatchers`
   * @type {Looper}
   */
  _reportsWatcher: undefined,

  /**
   * Interval [ms] used (as a one way computed property) by `_statusWatcher`
   * @type {number}
   */
  _statusInterval: computed('_isEnabled', function () {
    return this.get('_isEnabled') ? DEFAULT_UPDATE_INTERVAL : undefined;
  }),

  /**
   * Interval [ms] used (as a one way computed property) by `_reportsWatcher`
   * @type {number}
   */
  _reportsInterval: computed('_isEnabled', function () {
    // TODO: if current auto cleaning completes, produce new value or force update
    return this.get('_isEnabled') ? DEFAULT_UPDATE_INTERVAL : undefined;
  }),

  /**
   * It true, currently fetching reports from backend
   * Set by some interval watcher
   * @type {boolean}
   */
  _statusIsUpdating: undefined,

  /**
   * It true, currently fetching reports from backend
   * Set by some interval watcher
   * @type {boolean}
   */
  _reportsIsUpdating: undefined,

  /**
   * True if loading status for the first time after init
   * @type {Ember.ComputedProperty<boolean>}
   */
  _statusInitializing: computed(
    'status',
    '_statusIsUpdating',
    function () {
      return this.get('_statusIsUpdating') && this.get('status') == null;
    }
  ).readOnly(),

  /**
   * True if loading reports for the first time after init
   * @type {Ember.ComputedProperty<boolean>}
   */
  _reportsInitializing: computed(
    'reports',
    '_reportsIsUpdating',
    function () {
      return this.get('_reportsIsUpdating') && this.get('reports') == null;
    }
  ).readOnly(),

  /**
   * Error object from fetching status rejection
   * @type {any} typically a request error object
   */
  _statusError: null,

  /**
   * Error object from fetching reports rejection
   * @type {any} typically a request error object
   */
  _reportsError: null,

  /**
   * @type {Ember.ComputedProperty<Moment>}
   */
  _reportsFetchMoment: computed('_lastReportMoment', function () {
    const _lastReportMoment = this.get('_lastReportMoment');
    return _lastReportMoment || defaultReportsFetchMoment();
  }).readOnly(),

  // TODO: there should be no watcher for reports at all - it should be updated:
  // - after enabling
  // - on change status.isWorking true -> false

  /**
   * Create watchers that will have intervals aliased from this component properties 
   */
  createWatchers() {
    // TODO: refactor: code redundancy
    const _statusWatcher = Looper.create({
      immediate: true,
    });
    _statusWatcher
      .on('tick', () =>
        safeMethodExecution(this, 'updateStatus')
      );

    const _reportsWatcher = Looper.create({
      immediate: true,
    });
    _reportsWatcher
      .on('tick', () =>
        safeMethodExecution(this, 'updateReports')
      );

    this.setProperties({
      _reportsWatcher,
      _statusWatcher,
    });
  },

  reconfigureWatchers: observer(
    '_statusInterval',
    '_reportsInterval',
    function () {
      // debouncing does not let _setWatchersIntervals to be executed multiple
      // times, which can occur for observer
      run.debounce(this, '_setWatchersIntervals', 1);
    }
  ),

  _setWatchersIntervals() {
    // this method is invoked from debounce, so it's this can be destroyed
    if (this.isDestroyed === false) {
      const {
        _statusInterval,
        _reportsInterval,
        _statusWatcher,
        _reportsWatcher,
      } = this.getProperties(
        '_statusInterval',
        '_reportsInterval',
        '_statusWatcher',
        '_reportsWatcher',
      );
      set(_statusWatcher, 'interval', _statusInterval);
      set(_reportsWatcher, 'interval', _reportsInterval);
    }
  },

  /**
   * Last event time for reports, can be eg. `stoppedAt` moment of last report,
   * but also can be a `startedAt` of report in progress
   * @type {Ember.ComputedProperty<Moment>|null}
   */
  _lastReportMoment: computed('reports.@each.{startedAt,stoppedAt}', function () {
    const reports = this.get('reports');
    if (reports) {
      return _.max(
        _.map(reports, report => {
          const startedAt = get(report, 'startedAt');
          if (startedAt) {
            return moment(startedAt);
          } else {
            const stoppedAt = get(report, 'stoppedAt');
            if (stoppedAt) {
              return moment(stoppedAt);
            } else {
              return null;
            }
          }
        })
      );
    }
  }),

  updateStatus() {
    const {
      spaceManager,
      spaceId,
    } = this.getProperties('spaceManager', 'spaceId');
    this.set('_statusIsUpdating', true);
    return spaceManager.getAutoCleaningStatus(spaceId)
      .then(autoCleaningStatus => {
        this.set('_statusError', null);
        return this.set('status', autoCleaningStatus);
      })
      .catch(error => this.set('_statusError', error))
      .finally(() => this.set('_statusIsUpdating', false));
  },

  updateReports() {
    const {
      spaceManager,
      spaceId,
      _reportsFetchMoment,
    } = this.getProperties('spaceManager', 'spaceId', '_reportsFetchMoment');
    const startedAfter = _reportsFetchMoment.toISOString();
    this.set('_reportsIsUpdating', true);
    return spaceManager.getAutoCleaningReports(spaceId, startedAfter)
      .then(({ reportEntries }) => {
        this.set('_reportsError', null);
        return this.set('reports', reportEntries);
      })
      .catch(error => this.set('_reportsError', error))
      .finally(() => this.set('_reportsIsUpdating', false));
  },

  actions: {
    toggleCleaning() {
      const {
        updateAutoCleaning,
        _isEnabled,
      } = this.getProperties('updateAutoCleaning', '_isEnabled');
      return updateAutoCleaning({ enabled: !_isEnabled });
    },
    barValuesChanged(values) {
      let updateAutoCleaning = this.get('updateAutoCleaning');
      let settings = this.get('autoCleaning.settings');
      let changedValues = {};
      ['target', 'threshold'].forEach((fieldName) => {
        if (values[fieldName] !== get(settings, fieldName)) {
          changedValues[fieldName] = values[fieldName];
        }
      });
      return Object.keys(changedValues).length > 0 ?
        updateAutoCleaning({ settings: changedValues }) : Promise.resolve();
    },
    fileConditionsChanged(values) {
      let {
        updateAutoCleaning,
        autoCleaning,
      } = this.getProperties('updateAutoCleaning', 'autoCleaning');
      if (get(autoCleaning, 'enabled')) {
        updateAutoCleaning({ settings: values });
      }
    },
  },
});

function defaultReportsFetchMoment() {
  return moment().subtract(1, 'week');
}
