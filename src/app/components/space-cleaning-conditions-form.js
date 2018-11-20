/**
 * A form for file properties edition for space auto-cleaning functionality.
 *
 * @module components/space-cleaning-conditions-form
 * @author Michal Borzecki, Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

import { reads, union } from '@ember/object/computed';
import EmberObject, { computed, get } from '@ember/object';
import { cancel, debounce, run } from '@ember/runloop';
import { inject as service } from '@ember/service';
import bytesToString, { iecUnits } from 'onedata-gui-common/utils/bytes-to-string';
import _ from 'lodash';
import { buildValidations } from 'ember-cp-validations';
import createFieldValidator from 'onedata-gui-common/utils/create-field-validator';
import {
  MIN_LOWER_FILE_SIZE_LIMIT,
  MIN_UPPER_FILE_SIZE_LIMIT,
  MIN_OPEN_COUNT,
  MAX_FILE_SIZE,
  MIN_MIN_HOURS_SINCE_LAST_OPEN,
  MAX_MIN_HOURS_SINCE_LAST_OPEN,
  MAX_OPEN_COUNT,
} from 'onepanel-gui/utils/space-auto-cleaning-conditions';
import I18n from 'onedata-gui-common/mixins/components/i18n';

const FORM_SEND_DEBOUNCE_TIME = 4000;

const FILE_SIZE_LT_FIELD = {
  type: 'number',
  gte: MIN_UPPER_FILE_SIZE_LIMIT,
  lte: MAX_FILE_SIZE,
};
const FILE_SIZE_GT_FIELD = {
  type: 'number',
  gte: MIN_LOWER_FILE_SIZE_LIMIT,
  lte: MAX_FILE_SIZE,
};
const TIME_FIELD = {
  type: 'number',
  integer: true,
  gte: MIN_MIN_HOURS_SINCE_LAST_OPEN,
  lte: MAX_MIN_HOURS_SINCE_LAST_OPEN,
};
const COUNT_FIELD = {
  type: 'number',
  integer: true,
  gte: MIN_OPEN_COUNT,
  lte: MAX_OPEN_COUNT,
};

const TIME_NUMBER_FIELD = {
  type: 'number',
  integer: true,
};

const VALIDATORS = {
  '_formData.lowerFileSizeLimit': createFieldValidator(FILE_SIZE_GT_FIELD),
  '_formData.upperFileSizeLimit': createFieldValidator(FILE_SIZE_LT_FIELD),
  '_formData.minHoursSinceLastOpen': createFieldValidator(TIME_FIELD),
  '_formData.minHoursSinceLastOpenNumber': createFieldValidator(TIME_NUMBER_FIELD),
  '_formData.maxOpenCountNumber': createFieldValidator(COUNT_FIELD),
  '_formData.maxHourlyMovingAverageNumber': createFieldValidator(COUNT_FIELD),
  '_formData.maxDailyMovingAverageNumber': createFieldValidator(COUNT_FIELD),
  '_formData.maxMonthlyMovingAverageNumber': createFieldValidator(COUNT_FIELD),
};

export default Component.extend(buildValidations(VALIDATORS), I18n, {
  classNames: ['space-cleaning-conditions-form'],

  i18n: service(),
  onepanelServer: service(),
  globalNotify: service(),

  i18nPrefix: 'components.spaceCleaningConditionsForm',

  /**
   * Initial data for form.
   * @virtual
   * @type {Object}
   */
  data: null,

  /**
   * Action called on data send. The only arguments is an object with 
   * modified data.
   * @virtual
   * @type {Function}
   * @returns {Promise<undefined|any>} resolved value will be ignored
   */
  onSave: () => Promise.resolve(),

  isEnabled: reads('data.enabled'),

  /**
   * Form send debounce time.
   * @type {number}
   */
  formSendDebounceTime: FORM_SEND_DEBOUNCE_TIME,

  /**
   * Delay after "saved" text will be hidden
   * @type {number}
   */
  formSavedInfoHideTimeout: 3000,

  /**
   * Form save status
   * @type {string}
   */
  _formStatus: '',

  /**
   * If true, form has some unsaved changes.
   * @type {boolean}
   */
  _isDirty: false,

  /**
   * If true, some input have lost its focus since last save.
   * @type {boolean}
   */
  _lostInputfocus: false,

  /**
   * Save debounce timer handle
   * @type {Array}
   */
  _saveDebounceTimer: null,

  /**
   * Window object (for testing purposes).
   * @type {Window}
   */
  _window: window,

  _sourceFieldWithUnitNames: Object.freeze([
    'lowerFileSizeLimit',
    'upperFileSizeLimit',
    'minHoursSinceLastOpen',
  ]),

  _sourceFieldCountNames: Object.freeze([
    'maxOpenCount',
    'maxHourlyMovingAverage',
    'maxDailyMovingAverage',
    'maxMonthlyMovingAverage',
  ]),

  /**
   * Array of field names.
   * @type {ComputedProperty<Array<string>>}
   */
  _sourceFieldNames: union('_sourceFieldWithUnitNames', '_sourceFieldCountNames'),

  /**
   * Units used in 'file size' condition.
   * @type {Array.Object}
   */
  _sizeUnits: iecUnits,

  /**
   * Units used in 'not active for' condition.
   * @type {Array.Object}
   */
  _timeUnits: computed(function () {
    let i18n = this.get('i18n');
    let tPrefix = 'components.spaceCleaningConditionsForm.timeUnits.';
    return [{
      name: i18n.t(tPrefix + 'hours'),
      multiplicator: 1,
    }, {
      name: i18n.t(tPrefix + 'days'),
      multiplicator: 24,
    }];
  }),

  /**
   * Form data (has different format than the `data` property).
   * @type {Ember.Object}
   */
  _formData: computed('data', '_sizeUnits', '_timeUnits', {
    get() {
      return this._generateInitialData();
    },
    set(key, value) {
      return value;
    },
  }),

  /**
   * Page unload handler.
   * @type {computed.Function}
   */
  _unloadHandler: computed(function () {
    return () => {
      this._scheduleSendChanges(false);
      this._sendChanges();
    };
  }),

  /**
   * Fields errors.
   * @type {computed.Object}
   */
  _formFieldsErrors: computed('validations.errors.[]', '_sourceFieldNames', function () {
    let _sourceFieldNames = this.get('_sourceFieldNames');
    let errors = this.get('validations.errors');
    let fieldsErrors = {};
    _sourceFieldNames
      .forEach((fieldName) => {
        fieldsErrors[fieldName] =
          _.find(errors, { attribute: `_formData.${fieldName}Number` }) ||
          _.find(errors, { attribute: '_formData.' + fieldName });
      });
    return fieldsErrors;
  }),

  /**
   * Modification state of fields.
   * @type {Ember.Object}
   */
  _formFieldsModified: computed(function () {
    return EmberObject.create();
  }),

  init() {
    this._super(...arguments);
    let {
      _window,
      _unloadHandler,
    } = this.getProperties('_window', '_unloadHandler');
    _window.addEventListener('beforeunload', _unloadHandler);
  },

  willDestroyElement() {
    try {
      let {
        _window,
        _unloadHandler,
      } = this.getProperties('_window', '_unloadHandler');
      _window.removeEventListener('beforeunload', _unloadHandler);
      _unloadHandler();
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * Generates initial form data object using injected data
   * @returns {Object}
   */
  _generateInitialData() {
    let {
      data,
      _sizeUnits,
      _timeUnits,
      _sourceFieldWithUnitNames,
      _sourceFieldCountNames,
    } = this.getProperties(
      'data',
      '_sizeUnits',
      '_timeUnits',
      '_sourceFieldWithUnitNames',
      '_sourceFieldCountNames',
    );
    this._cleanModificationState();
    if (!data) {
      data = {};
    }
    let _formData = EmberObject.create();
    [
      'lowerFileSizeLimit',
      'upperFileSizeLimit',
    ].forEach((fieldName) => {
      const field = get(data, fieldName);
      const enabled = field.enabled;
      let value = field.value;
      value = bytesToString(value, { iecFormat: true, separated: true });
      _formData.setProperties({
        [fieldName + 'Enabled']: enabled,
        [fieldName + 'Number']: String(value.number),
        [fieldName + 'Unit']: _.find(_sizeUnits, { name: value.unit }),
      });
    });

    const minHoursSinceLastOpen = get(data, 'minHoursSinceLastOpen');
    let unit = _timeUnits[0];
    _timeUnits.forEach((u) => {
      if (minHoursSinceLastOpen / u.multiplicator >= 1) {
        unit = u;
      }
    });
    _formData.setProperties({
      minHoursSinceLastOpenEnabled: get(minHoursSinceLastOpen, 'enabled'),
      minHoursSinceLastOpenNumber: String(
        get(minHoursSinceLastOpen, 'value') / unit.multiplicator
      ),
      minHoursSinceLastOpenUnit: unit,
    });

    [
      'maxOpenCount',
      'maxHourlyMovingAverage',
      'maxDailyMovingAverage',
      'maxMonthlyMovingAverage',
    ].forEach((fieldName) => {
      const { enabled, value } = get(data, fieldName);
      _formData.setProperties({
        [fieldName + 'Enabled']: enabled,
        [fieldName + 'Number']: String(value),
      });
    });
    _sourceFieldWithUnitNames.forEach(fieldName => {
      _formData.set(fieldName, computed(
        `${fieldName}Number`,
        `${fieldName}Unit`,
        function () {
          const number = Math.floor(
            parseFloat(this.get(`${fieldName}Number`))
          );
          const unit = this.get(`${fieldName}Unit`);
          return number > 0 && unit ? number * unit.multiplicator : '';
        }));
    });
    _sourceFieldCountNames.forEach(fieldName => {
      _formData.set(fieldName, computed(
        `${fieldName}Number`,
        function () {
          const number = Math.floor(parseFloat(this.get(`${fieldName}Number`)));
          return number > 0 ? number : '';
        }));
    });
    return _formData;
  },

  /**
   * Checks if modified values are valid and can be saved
   * @returns {boolean} true if values are valid, false otherwise
   */
  _isValid() {
    let {
      _formFieldsErrors,
      _formFieldsModified: modified,
      _formData,
      _sourceFieldNames,
    } = this.getProperties(
      '_formFieldsErrors',
      '_formFieldsModified',
      '_formData',
      '_sourceFieldNames',
    );
    let isValid = true;
    _sourceFieldNames.forEach((fieldName) => {
      const isModified = modified.get(fieldName + 'Number') ||
        modified.get(fieldName + 'Unit');
      if (_formData.get(fieldName + 'Enabled') && isModified &&
        _formFieldsErrors[fieldName]) {
        isValid = false;
      }
    });
    return isValid;
  },

  _modifiedData() {
    const {
      _formData,
      _sourceFieldNames,
      _formFieldsModified: modified,
    } = this.getProperties(
      '_formFieldsModified',
      '_formData',
      '_sourceFieldNames',
    );
    const data = {};
    _sourceFieldNames.forEach((fieldName) => {
      const isValueModified = modified.get(fieldName + 'Number') ||
        modified.get(fieldName + 'Unit');
      const isEnabledModified = modified.get(fieldName + 'Enabled');
      if (isValueModified || isEnabledModified) {
        data[fieldName] = data[fieldName] || {};
        const field = data[fieldName];
        if (isEnabledModified) {
          field.enabled = _formData.get(fieldName + 'Enabled');
        }
        if (isValueModified && _formData.get(fieldName + 'Enabled')) {
          field.value = _formData.get(fieldName);
        }
      }
    });
    return data;
  },

  /**
   * Sends modified data.
   */
  _sendChanges() {
    let {
      _isDirty,
      onSave,
      formSavedInfoHideTimeout,
    } = this.getProperties(
      '_isDirty',
      'onSave',
      'formSavedInfoHideTimeout'
    );
    if (_isDirty && this._isValid()) {
      const data = this._modifiedData();
      if (Object.keys(data).length === 0) {
        return;
      }
      this._cleanModificationState();
      this.set('_formStatus', 'saving');
      onSave(data).then(() => {
        if (!this.isDestroyed && !this.isDestroying) {
          this.set('_formStatus', 'saved');
          run.later(this, () => {
            if (!this.isDestroyed && !this.isDestroying) {
              // prevent resetting state other than saved
              if (this.get('_formStatus') === 'saved') {
                this.set('_formStatus', '');
              }
            }
          }, formSavedInfoHideTimeout);
        }
      }).catch(() => {
        this.set('_formStatus', 'failed');
        this.set('_formData', this._generateInitialData());
        this._cleanModificationState();
      });
      this.setProperties({
        _lostInputFocus: false,
        _isDirty: false,
      });
    }
  },

  /**
   * Marks all fields as not modified.
   */
  _cleanModificationState() {
    let _formFieldsModified = this.get('_formFieldsModified');
    Object.keys(_formFieldsModified)
      .forEach((key) => _formFieldsModified.set(key, false));
  },

  /**
   * Schedules changes send (with debounce).
   * @param {boolean} schedule If false, scheduled save will be canceled.
   */
  _scheduleSendChanges(schedule = true) {
    let {
      _saveDebounceTimer,
      formSendDebounceTime,
    } = this.getProperties('_saveDebounceTimer', 'formSendDebounceTime');
    if (schedule === false) {
      cancel(_saveDebounceTimer);
    } else {
      const data = this._modifiedData();
      if (Object.keys(data).length > 0 && this._isValid()) {
        this.set('_formStatus', 'modified');
        this.set(
          '_saveDebounceTimer',
          debounce(this, '_sendChanges', formSendDebounceTime)
        );
      } else {
        if (this.get('_formStatus') === 'modified') {
          this.set('_formStatus', '');
        }
        cancel(_saveDebounceTimer);
      }
    }
  },

  actions: {
    dataChanged(fieldName, value) {
      this.set('_formData.' + fieldName, value);
      this.set('_isDirty', true);
      this.set('_formFieldsModified.' + fieldName, true);
      if (!_.endsWith(fieldName, 'Number') || this.get('_lostInputFocus')) {
        this._scheduleSendChanges();
      }
      if (_.endsWith(fieldName, 'Enabled') && value) {
        const numberField =
          fieldName.substring(0, fieldName.length - 'Enabled'.length);
        run.next(() => {
          if (!this.isDestroyed && !this.isDestroying) {
            this.$(`#${this.get('elementId')}${numberField}`).focus();
          }
        });
      }
    },
    configureEnabled(enabled) {
      return this.get('onSave')({ enabled }).catch(error => {
        this.get('globalNotify').backendError(
          this.t('togglingSelectiveCleaning'),
          error
        );
      });
    },
    lostFocus() {
      this.set('_lostInputFocus', true);
      this._scheduleSendChanges();
    },
    forceSave() {
      this._scheduleSendChanges(false);
      this._sendChanges();
    },
  },
});
