/**
 * A form for file properties edition for space auto-cleaning functionality.
 *
 * @module components/space-cleaning-conditions-form
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import bytesToString from 'onedata-gui-common/utils/bytes-to-string';
import _ from 'lodash';
import { buildValidations } from 'ember-cp-validations';
import createFieldValidator from 'onedata-gui-common/utils/create-field-validator';

const {
  get,
  computed,
  computed: {
    equal,
  },
  observer,
  on,
  run: {
    debounce,
    cancel,
  },
  inject: {
    service,
  },
} = Ember;

const FORM_SEND_DEBOUNCE_TIME = 4000;

const SIZE_FIELD = {
  type: 'number',
  optional: true,
  gte: 0,
};
const TIME_FIELD = {
  type: 'number',
  optional: true,
  gte: 0,
  integer: true,
};

const VALIDATORS = {
  '_formData.fileSizeGreaterThanNumber': createFieldValidator(SIZE_FIELD),
  '_formData.fileSizeLesserThanNumber': createFieldValidator(SIZE_FIELD),
  '_formData.fileTimeNotActiveNumber': createFieldValidator(TIME_FIELD),
};

export default Ember.Component.extend(buildValidations(VALIDATORS), {
  classNames: ['space-cleaning-conditions-form'],

  i18n: service(),

  /**
   * Initial data for form.
   * @type {Object}
   */
  data: null,

  /**
   * Action called on data send. The only arguments is an object with 
   * modified data.
   * @type {Function}
   */
  onSave: () => {},

  /**
   * Form send debounce time.
   * @type {number}
   */
  _formSendDebounceTime: FORM_SEND_DEBOUNCE_TIME,

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
    'fileSizeLesserThan',
    'fileTimeNotActive',
  ],

  /**
   * Units used in 'file size' condition.
   * @type {Array.Object}
   */
  _sizeUnits: [{
    name: 'B',
    multiplicator: 1,
  }, {
    name: 'KiB',
    multiplicator: 1024,
  }, {
    name: 'MiB',
    multiplicator: 1048576,
  }, {
    name: 'GiB',
    multiplicator: 1073741824,
  }, {
    name: 'TiB',
    multiplicator: 1099511627776,
  }],

  /**
   * Units used in 'not active for' condition.
   * @type {Array.Object}
   */
  _timeUnits: computed(function () {
    let i18n = this.get('i18n');
    let tPrefix = 'components.spaceCleaningConditionsForm.timeUnits.';
    return [{
      name: i18n.t(tPrefix + 'seconds'),
      multiplicator: 1,
    }, {
      name: i18n.t(tPrefix + 'minutes'),
      multiplicator: 60,
    }, {
      name: i18n.t(tPrefix + 'hours'),
      multiplicator: 3600,
    }, {
      name: i18n.t(tPrefix + 'days'),
      multiplicator: 86400,
    }];
  }),

  /**
   * Form data (has different format than the `data` property).
   * @type {Ember.Object}
   */
  _formData: null,

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
      .map((fieldName) => fieldName + 'Number')
      .forEach((fieldName) => fieldsErrors[fieldName] =
        _.find(errors, { attribute: '_formData.' + fieldName })
      );
    return fieldsErrors;
  }),

  /**
   * Modification state of fields.
   * @type {Ember.Object}
   */
  _formFieldsModified: computed(function () {
    return Ember.Object.create();
  }),

  /**
   * If true, form is valid.
   * @type {computed.boolean}
   */
  _isFormValid: equal('validations.errors.length', 0),

  _dataObserver: on('init', observer('data', function () {
    let {
      data,
      _sizeUnits,
      _timeUnits,
    } = this.getProperties('data', '_sizeUnits', '_timeUnits');
    this._cleanModificationState();
    if (!data) {
      data = {};
    }
    let _formData = Ember.Object.create();
    [
      'fileSizeGreaterThan',
      'fileSizeLesserThan',
    ].forEach((fieldName) => {
      if (get(data, fieldName)) {
        let value = bytesToString(
          get(data, fieldName), { iecFormat: true, separated: true }
        );
        _formData.setProperties({
          [fieldName + 'Number']: String(value.number),
          [fieldName + 'Unit']: _.find(_sizeUnits, { name: value.unit }),
        });
      } else {
        _formData.setProperties({
          [fieldName + 'Number']: '',
          [fieldName + 'Unit']: _.find(_sizeUnits, { name: 'MiB' }),
        });
      }
    });
    if (get(data, 'fileTimeNotActive')) {
      let fileTimeNotActive = get(data, 'fileTimeNotActive');
      let unit = _timeUnits[0];
      _timeUnits.forEach((u) => {
        if (fileTimeNotActive / u.multiplicator >= 1) {
          unit = u;
        }
      });
      _formData.setProperties({
        fileTimeNotActiveNumber: String(fileTimeNotActive / unit.multiplicator),
        fileTimeNotActiveUnit: unit,
      });
    } else {
      _formData.setProperties({
        fileTimeNotActiveNumber: '',
        fileTimeNotActiveUnit: _timeUnits[_timeUnits.length - 1],
      });
    }
    this.set('_formData', _formData);
  })),

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
   * Sends modified data.
   */
  _sendChanges() {
    let {
      _isDirty,
      _isFormValid,
      _formFieldsModified: modified,
      _formData,
      onSave,
    } = this.getProperties(
      '_isDirty',
      '_isFormValid',
      '_formFieldsModified',
      '_formData',
      'onSave'
    );
    if (_isDirty && _isFormValid) {
      this.setProperties({
        _lostInputFocus: false,
        _isDirty: false,
      });

      let data = {};
      [
        'fileSizeGreaterThan',
        'fileSizeLesserThan',
        'fileTimeNotActive',
      ].forEach((fieldName) => {
        if (modified.get(fieldName + 'Number') || modified.get(fieldName + 'Unit')) {
          data[fieldName] = _formData.get(fieldName + 'Number') *
            _formData.get(fieldName + 'Unit').multiplicator;
        }
      });
      this._cleanModificationState();
      onSave(data);
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
      _formSendDebounceTime,
    } = this.getProperties('_saveDebounceTimer', '_formSendDebounceTime');
    if (schedule === false) {
      cancel(_saveDebounceTimer);
    }
    this.set(
      '_saveDebounceTimer',
      debounce(this, '_sendChanges', _formSendDebounceTime)
    );
  },

  actions: {
    dataChanged(field, value) {
      this.set('_formData.' + field, value);
      this.set('_isDirty', true);
      this.set('_formFieldsModified.' + field, true);
      // all dropdowns ends with 'Unit' word
      if (field.indexOf('Unit') + 4 === field.length || this.get('_lostInputFocus')) {
        this._scheduleSendChanges();
      }
    },
    lostFocus() {
      this.set('_lostInputFocus', true);
      this._scheduleSendChanges();
    },
  },
});
