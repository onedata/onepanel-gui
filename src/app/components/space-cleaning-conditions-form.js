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
} = Ember;

const FORM_SEND_DEBOUNCE_TIME = 3000;

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
  '_formData.largerThanNumber': createFieldValidator(SIZE_FIELD),
  '_formData.smallerThanNumber': createFieldValidator(SIZE_FIELD),
  '_formData.notActiveForNumber': createFieldValidator(TIME_FIELD),
};

export default Ember.Component.extend(buildValidations(VALIDATORS), {
  classNames: ['space-cleaning-conditions-form'],

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
  _formFieldsErrors: computed('validations.errors.[]', function () {
    let errors = this.get('validations.errors');
    let fieldsErrors = {};
    [
      'largerThanNumber',
      'smallerThanNumber',
      'notActiveForNumber',
    ].forEach((fieldName) => fieldsErrors[fieldName] = 
      _.find(errors, { attribute: '_formData.' + fieldName })
    );
    return fieldsErrors;
  }),

  /**
   * Modification state of fields.
   * @type {Ember.Object}
   */
  _formFieldsModified: Ember.Object.create(),

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
    if (!data) {
      data = {};
    }
    let _formData = Ember.Object.create();
    if (get(data, 'largerThan')) {
      let converterLargerThan = 
        bytesToString(get(data, 'largerThan'), { iecFormat: true, separated: true });
      _formData.setProperties({
        largerThanNumber: String(converterLargerThan.number),
        largerThanUnit: _.find(_sizeUnits, { name: converterLargerThan.unit }),
      });
    } else {
      _formData.setProperties({
        largerThanNumber: '',
        largerThanUnit: _.find(_sizeUnits, { name: 'MiB' }),
      });
    }
    if (get(data, 'smallerThan')) {
      let converterSmallerThan = 
        bytesToString(get(data, 'smallerThan'), { iecFormat: true, separated: true });
      _formData.setProperties({
        smallerThanNumber: String(converterSmallerThan.number),
        smallerThanUnit: _.find(_sizeUnits, { name: converterSmallerThan.unit }),
      });
    } else {
      _formData.setProperties({
        smallerThanNumber: '',
        smallerThanUnit: _.find(_sizeUnits, { name: 'MiB' }),
      });
    }
    if (get(data, 'notActiveFor')) {
      let notActiveFor = get(data, 'notActiveFor');
      let unit = _timeUnits[0];
      _timeUnits.forEach((u) => {
        if (notActiveFor / u.multiplicator >= 1) {
          unit = u;
        }
      });
      _formData.setProperties({
        smallerThanNumber: String(notActiveFor / unit.multiplicator),
        smallerThanUnit: unit,
      });
    } else {
      _formData.setProperties({
        notActiveForNumber: '',
        notActiveForUnit: _timeUnits[3],
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
    console.log('trying to send');
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
      console.log('send');

      let data = {};
      if (modified.get('largerThanNumber') || modified.get('largerThanUnit')) {
        data.largerThan = _formData.get('largerThanNumber') * 
          _formData.get('largerThanUnit').multiplicator;
      }
      if (modified.get('smallerThanNumber') || modified.get('smallerThanUnit')) {
        data.smallerThan = _formData.get('smallerThanNumber') * 
          _formData.get('smallerThanUnit').multiplicator;
      }
      if (modified.get('notActiveForNumber') || modified.get('notActiveForThanUnit')) {
        data.notActiveFor = _formData.get('notActiveForNumber') * 
          _formData.get('notActiveForUnit').multiplicator;
      }
      Object.keys(modified).forEach((key) => modified.set(key, false));
      console.log(data);
      onSave(data);
    }
  },

  /**
   * Schedules changes send (with debounce).
   * @param {boolean} schedule If false, scheduled save will be canceled.
   */
  _scheduleSendChanges(schedule = true) {
    if (schedule === false) {
      cancel(this.get('_saveDebounceTimer'));
    }
    this.set(
      '_saveDebounceTimer',
      debounce(this, '_sendChanges', FORM_SEND_DEBOUNCE_TIME)
    );
  },

  actions: {
    dataChanged(field, value) {
      this.setProperties({
        ['_formData.' + field]: value,
        _isDirty: true,
      });
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
