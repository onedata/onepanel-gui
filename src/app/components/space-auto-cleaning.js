import Component from '@ember/component';
import EmberObject from '@ember/object';
import { computed, get, observer } from '@ember/object';
import { inject } from '@ember/service';
import { Promise } from 'rsvp';

const BLANK_AUTO_CLEANING = {
  enabled: false,
};

const DEFAULT_UPDATE_INTERVAL = 1000;

import Looper from 'onedata-gui-common/utils/looper';
import safeMethodExecution from 'onedata-gui-common/utils/safe-method-execution';

export default Component.extend({
  spaceManager: inject(),

  classNames: ['space-auto-cleaning'],

  /**
   * ID of SpaceDetails for which auto cleaning view is rendered
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
   * Cleaning status.
   * @virtual
   * @type {Onepanel.AutoCleaningStatus}
   */
  status: undefined,

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  _isEnabled: computed.readOnly('autoCleaning.enabled'),

  /**
   * Data for bar chart.
   * @type {computed.Ember.Object}
   */
  barData: computed(
    'autoCleaning.settings.{spaceSoftQuota,spaceHardQuota}',
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
        spaceSoftQuota: get(autoCleaning, 'settings.spaceSoftQuota'),
        spaceHardQuota: get(autoCleaning, 'settings.spaceHardQuota'),
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

  /**
   * @type {Array<SpaceAutoCleaningReport>}
   */
  reports: [],

  init() {
    this._super(...arguments);
    // if the component is initialized with blank autoCleaning,
    // we should provide an empty valid autoCleaning
    this.set('autoCleaning', BLANK_AUTO_CLEANING);

    this.setProperties({
      autoCleaning: BLANK_AUTO_CLEANING,
      _statusIsUpdating: true,
      _reportsIsUpdating: true,
    });

    this.createAutoCleaningWatchers();
  },

  /// -- FIXME: decide these data functions should be here

  /**
   * Initialized with `createAutoCleaningWatchers`
   * @type {Looper}
   */
  _statusWatcher: undefined,

  /**
   * Initialized with `createAutoCleaningWatchers`
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

  _statusIsUpdating: undefined,

  _reportsIsUpdating: undefined,

  _statusInitializing: computed(
    'status',
    '_statusIsUpdating',
    function () {
      return !!(!this.get('status') &&
        this.get('updateAutoCleaningStatus')
      );
    }),

  _reportsInitializing: computed(
    'reports',
    '_reportsIsUpdating',
    function () {
      return !!(!this.get('reports') &&
        this.get('updateAutoCleaningReports')
      );
    }),

  /**
   * Create watchers that will have intervals aliased from this component properties 
   */
  createAutoCleaningWatchers() {
    // TODO: refactor: code redundancy
    const _statusWatcher = Looper.create({
      immediate: true,
    });
    _statusWatcher
      .on('tick', () =>
        safeMethodExecution(this, 'updateAutoCleaningStatus')
      );

    const _reportsWatcher = Looper.create({
      immediate: true,
    });
    _reportsWatcher
      .on('tick', () =>
        safeMethodExecution(this, 'updateAutoCleaningReports')
      );

    this.setProperties({
      _reportsWatcher,
      _statusWatcher,
    });
  },

  reconfigureSyncWatchers: observer(
    '_statusInterval',
    '_reportsInterval',
    function () {
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
      _statusWatcher.set('interval', _statusInterval);
      _reportsWatcher.set('interval', _reportsInterval);
    }
  ),

  updateAutoCleaningStatus() {
    const {
      spaceManager,
      spaceId,
    } = this.getProperties('spaceManager', 'spaceId');
    this.set('_statusIsUpdating', true);
    return spaceManager.getAutoCleaningStatus(spaceId)
      .then(autoCleaningStatus => {
        return this.set('status', autoCleaningStatus);
      })
      .finally(() => this.set('_statusIsUpdating', false));
    // .catch( /** FIXME: error handling */ );
  },

  updateAutoCleaningReports() {
    const {
      spaceManager,
      spaceId,
    } = this.getProperties('spaceManager', 'spaceId');
    this.set('_reportsIsUpdating', true);
    return spaceManager.getAutoCleaningReports(spaceId)
      .then(({ reportEntries }) => {
        return this.set('reports', reportEntries);
      })
      .finally(() => this.set('_reportsIsUpdating', false));
    // .catch( /** FIXME: error handling */ );
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
      ['spaceSoftQuota', 'spaceHardQuota'].forEach((fieldName) => {
        if (values[fieldName] !== get(settings, fieldName)) {
          changedValues[fieldName] = values[fieldName];
        }
      });
      return Object.keys(changedValues).length > 0 ?
        updateAutoCleaning({ settings: changedValues }) : Promise.resolve();
    },
    fileConditionsChanged(values) {
      this.get('updateAutoCleaning')({ settings: values });
    },
  },
});
