/**
 * A form for file properties edition for space auto-cleaning functionality.
 *
 * @module components/space-cleaning-conditions-form
 * @author Michal Borzecki, Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import bytesToString, { iecUnits } from 'onedata-gui-common/utils/bytes-to-string';
import _ from 'lodash';
import { buildValidations } from 'ember-cp-validations';
import createFieldValidator from 'onedata-gui-common/utils/create-field-validator';
import {
  MIN_GREATER_FILE_SIZE,
  MIN_LESS_FILE_SIZE,
  MAX_FILE_SIZE,
  MIN_FILE_HOURS,
  MAX_FILE_HOURS,
  DISABLE_GREATER_FILE_SIZE,
  DISABLE_LESS_FILE_SIZE,
  DISABLE_FILE_HOURS,
  validFileGreaterThan,
  validFileLessThan,
  validFileNotActiveHours,
} from 'onepanel-gui/utils/space-auto-cleaning-conditions';

const {
  get,
  computed,
  run,
  run: {
    debounce,
    cancel,
  },
  inject: {
    service,
  },
} = Ember;

function isFieldEnabled(fieldName, value) {
  const fun = {
    fileSizeGreaterThan: validFileGreaterThan,
    fileSizeLessThan: validFileLessThan,
    fileNotActiveHours: validFileNotActiveHours,
  }[fieldName];
  if (fun) {
    return fun(value);
  }
}

function disableFieldValue(fieldName) {
  return {
    fileSizeGreaterThan: DISABLE_GREATER_FILE_SIZE,
    fileSizeLessThan: DISABLE_LESS_FILE_SIZE,
    fileNotActiveHours: DISABLE_FILE_HOURS,
  }[fieldName];
}

const FORM_SEND_DEBOUNCE_TIME = 4000;

const SIZE_LT_FIELD = {
  type: 'number',
  gte: MIN_LESS_FILE_SIZE,
  lte: MAX_FILE_SIZE,
};
const SIZE_GT_FIELD = {
  type: 'number',
  gte: MIN_GREATER_FILE_SIZE,
  lte: MAX_FILE_SIZE,
};
const TIME_FIELD = {
  type: 'number',
  integer: true,
  gte: MIN_FILE_HOURS,
  lte: MAX_FILE_HOURS,
};

const TIME_NUMBER_FIELD = {
  type: 'number',
  integer: true,
};

const VALIDATORS = {
  '_formData.fileSizeGreaterThan': createFieldValidator(SIZE_GT_FIELD),
  '_formData.fileSizeLessThan': createFieldValidator(SIZE_LT_FIELD),
  '_formData.fileNotActiveHours': createFieldValidator(TIME_FIELD),
  '_formData.fileNotActiveHoursNumber': createFieldValidator(TIME_NUMBER_FIELD),
};

export default Ember.Component.extend(buildValidations(VALIDATORS), {
  classNames: ['space-cleaning-conditions-form'],

  i18n: service(),

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
   */
  onSave: () => Promise.resolve(),

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
   * Save status text
   * @type {string}
   */
  _formStatusText: '',

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

  /**
   * Array of field names.
   * @type {Array.string}
   */
  _sourceFieldNames: [
    'fileSizeGreaterThan',
    'fileSizeLessThan',
    'fileNotActiveHours',
  ],

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
  _formData: computed('data', '_sizeUnits', '_timeUnits', function () {
    let {
      data,
      _sizeUnits,
      _timeUnits,
      _sourceFieldNames,
    } = this.getProperties('data', '_sizeUnits', '_timeUnits', '_sourceFieldNames');
    this._cleanModificationState();
    if (!data) {
      data = {};
    }
    let _formData = Ember.Object.create();
    [
      'fileSizeGreaterThan',
      'fileSizeLessThan',
    ].forEach((fieldName) => {
      let value = get(data, fieldName);
      if (typeof value === 'number' && isFieldEnabled(fieldName, value)) {
        value = bytesToString(value, { iecFormat: true, separated: true });
        _formData.setProperties({
          [fieldName + 'Enabled']: true,
          [fieldName + 'Number']: String(value.number),
          [fieldName + 'Unit']: _.find(_sizeUnits, { name: value.unit }),
        });
      } else {
        _formData.setProperties({
          [fieldName + 'Enabled']: false,
          [fieldName + 'Number']: '',
          [fieldName + 'Unit']: _.find(_sizeUnits, { name: 'MiB' }),
        });
      }
    });
    let fileNotActiveHours = get(data, 'fileNotActiveHours');
    if (typeof fileNotActiveHours === 'number' &&
      isFieldEnabled('fileNotActiveHours', fileNotActiveHours)) {
      let unit = _timeUnits[0];
      _timeUnits.forEach((u) => {
        if (fileNotActiveHours / u.multiplicator >= 1) {
          unit = u;
        }
      });
      _formData.setProperties({
        fileNotActiveHoursEnabled: true,
        fileNotActiveHoursNumber: String(fileNotActiveHours / unit.multiplicator),
        fileNotActiveHoursUnit: unit,
      });
    } else {
      _formData.setProperties({
        fileNotActiveHoursEnabled: false,
        fileNotActiveHoursNumber: '',
        fileNotActiveHoursUnit: _timeUnits[0],
      });
    }
    _sourceFieldNames.forEach(fieldName => {
      _formData.set(fieldName, computed(
        `${fieldName}Number`,
        `${fieldName}Unit`,
        function () {
          const number = Math.floor(parseFloat(this.get(
            `${fieldName}Number`)));
          const unit = this.get(`${fieldName}Unit`);
          return number > 0 && unit ? number * unit.multiplicator : '';
        }));
    });
    return _formData;
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
    return Ember.Object.create();
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

  /**
   * Sends modified data.
   */
  _sendChanges() {
    let {
      _isDirty,
      _formFieldsModified: modified,
      _formData,
      _sourceFieldNames,
      onSave,
      i18n,
      formSavedInfoHideTimeout,
    } = this.getProperties(
      '_isDirty',
      '_formFieldsModified',
      '_formData',
      '_sourceFieldNames',
      'onSave',
      'i18n',
      'formSavedInfoHideTimeout'
    );
    this.set('_saveDebounceTimer', null);
    if (_isDirty && this._isValid()) {
      let data = {};
      _sourceFieldNames.forEach((fieldName) => {
        const isModified = modified.get(fieldName + 'Number') ||
          modified.get(fieldName + 'Unit');
        if (_formData.get(fieldName + 'Enabled') && isModified) {
          data[fieldName] = _formData.get(fieldName);
        } else if (modified.get(fieldName + 'Enabled') &&
          !_formData.get(fieldName + 'Enabled')) {
          data[fieldName] = disableFieldValue(fieldName);
        }
      });
      if (Object.keys(data).length === 0) {
        return;
      }
      this._cleanModificationState();
      this.set(
        '_formStatusText',
        i18n.t('components.spaceCleaningConditionsForm.saving')
      );
      onSave(data).then(() => {
        if (!this.isDestroyed && !this.isDestroying) {
          this.set(
            '_formStatusText',
            i18n.t('components.spaceCleaningConditionsForm.saved')
          );
          run.later(this, () => {
            if (!this.isDestroyed && !this.isDestroying &&
              !this.get('_saveDebounceTimer')) {
              this.set('_formStatusText', '');
            }
          }, formSavedInfoHideTimeout);
        }
      }).catch(() => {
        this.set(
          '_formStatusText',
          'failed'
        );
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
      this.set(
        '_saveDebounceTimer',
        debounce(this, '_sendChanges', formSendDebounceTime)
      );
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
    lostFocus() {
      this.set('_lostInputFocus', true);
      this._scheduleSendChanges();
    },
  },
});
