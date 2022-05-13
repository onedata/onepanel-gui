/**
 * A form for file properties edition for space auto-cleaning functionality.
 *
 * @module components/space-cleaning-conditions-form
 * @author Michal Borzecki, Jakub Liput
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

import { reads, union } from '@ember/object/computed';
import EmberObject, { computed, get, defineProperty } from '@ember/object';
import { run } from '@ember/runloop';
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
import AutoSaveForm from 'onedata-gui-common/mixins/components/auto-save-form';
import $ from 'jquery';

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
  'formData.minFileSize': createFieldValidator(FILE_SIZE_GT_FIELD),
  'formData.maxFileSize': createFieldValidator(FILE_SIZE_LT_FIELD),
  'formData.minHoursSinceLastOpen': createFieldValidator(TIME_FIELD),
  'formData.minHoursSinceLastOpenNumber': createFieldValidator(TIME_NUMBER_FIELD),
  'formData.maxOpenCountNumber': createFieldValidator(COUNT_FIELD),
  'formData.maxHourlyMovingAverageNumber': createFieldValidator(COUNT_FIELD),
  'formData.maxDailyMovingAverageNumber': createFieldValidator(COUNT_FIELD),
  'formData.maxMonthlyMovingAverageNumber': createFieldValidator(COUNT_FIELD),
};

export default Component.extend(buildValidations(VALIDATORS), I18n, AutoSaveForm, {
  classNames: ['space-cleaning-conditions-form', 'auto-save-form'],

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

  isEnabled: reads('data.enabled'),

  /**
   * Delay after "saved" text will be hidden
   * @type {number}
   */
  formSavedInfoHideTimeout: 3000,

  _sourceFieldWithUnitNames: Object.freeze([
    'minFileSize',
    'maxFileSize',
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
  sourceFieldNames: union('_sourceFieldWithUnitNames', '_sourceFieldCountNames'),

  /**
   * Units used in 'file size' condition.
   * @type {Array.Object}
   */
  _sizeUnits: computed(function sizeUnits() {
    return ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'].map(name =>
      iecUnits.find(u => u.name === name)
    );
  }),

  /**
   * Units used in 'not active for' condition.
   * @type {Array.Object}
   */
  _timeUnits: computed(function () {
    const i18n = this.get('i18n');
    const tPrefix = 'components.spaceCleaningConditionsForm.timeUnits.';
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
   * @override
   */
  formData: computed('data', '_sizeUnits', '_timeUnits', {
    get() {
      return this.generateInitialData();
    },
    set(key, value) {
      return value;
    },
  }),

  /**
   * Fields errors.
   * @type {computed.Object}
   * @override
   */
  formFieldsErrors: computed('validations.errors.[]', 'sourceFieldNames', function () {
    const sourceFieldNames = this.get('sourceFieldNames');
    const errors = this.get('validations.errors');
    const fieldsErrors = {};
    sourceFieldNames
      .forEach((fieldName) => {
        fieldsErrors[fieldName] =
          _.find(errors, { attribute: `formData.${fieldName}Number` }) ||
          _.find(errors, { attribute: 'formData.' + fieldName });
      });
    return fieldsErrors;
  }),

  /**
   * Generates initial form data object using injected data
   * @returns {Object}
   * @override
   */
  generateInitialData() {
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
    this.cleanModificationState();
    if (!data) {
      data = {};
    }
    const formData = EmberObject.create();
    [
      'minFileSize',
      'maxFileSize',
    ].forEach((fieldName) => {
      const field = get(data, fieldName) || { enabled: false, value: 0 };
      const enabled = field.enabled;
      const bytesValue = bytesToString(field.value, {
        iecFormat: true,
        separated: true,
      });
      formData.setProperties({
        [fieldName + 'Enabled']: enabled,
        [fieldName + 'Number']: String(bytesValue.number),
        [fieldName + 'Unit']: _.find(_sizeUnits, { name: bytesValue.unit }) || {
          multiplicator: 1,
          name: 'B',
        },
      });
    });

    let minHoursSinceLastOpenField = get(data, 'minHoursSinceLastOpen');
    minHoursSinceLastOpenField = minHoursSinceLastOpenField || {
      enabled: false,
      value: 0,
    };
    let unit = _timeUnits[0];
    _timeUnits.forEach((u) => {
      if (minHoursSinceLastOpenField / u.multiplicator >= 1) {
        unit = u;
      }
    });
    formData.setProperties({
      minHoursSinceLastOpenEnabled: get(minHoursSinceLastOpenField, 'enabled'),
      minHoursSinceLastOpenNumber: String(
        get(minHoursSinceLastOpenField, 'value') / unit.multiplicator
      ),
      minHoursSinceLastOpenUnit: unit,
    });

    [
      'maxOpenCount',
      'maxHourlyMovingAverage',
      'maxDailyMovingAverage',
      'maxMonthlyMovingAverage',
    ].forEach((fieldName) => {
      let field = get(data, fieldName);
      field = field || { enabled: false, value: 0 };
      const { enabled, value } = field;
      formData.setProperties({
        [fieldName + 'Enabled']: enabled,
        [fieldName + 'Number']: String(value),
      });
    });

    // Computing display number and units in form
    _sourceFieldWithUnitNames.forEach(fieldName => {
      defineProperty(formData, fieldName, computed(
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
      defineProperty(formData, fieldName, computed(
        `${fieldName}Number`,
        function () {
          const number = Math.floor(parseFloat(this.get(`${fieldName}Number`)));
          return number > 0 ? number : '';
        }));
    });
    return formData;
  },

  /**
   * @override
   */
  modifiedData() {
    const {
      formData,
      sourceFieldNames,
      formFieldsModified: modified,
    } = this.getProperties(
      'formFieldsModified',
      'formData',
      'sourceFieldNames',
    );
    const data = {};
    sourceFieldNames.forEach((fieldName) => {
      const isValueModified = modified.get(fieldName + 'Number') ||
        modified.get(fieldName + 'Unit');
      const isEnabledModified = modified.get(fieldName + 'Enabled');
      if (isValueModified || isEnabledModified) {
        data[fieldName] = data[fieldName] || {};
        const field = data[fieldName];
        if (isEnabledModified) {
          field.enabled = formData.get(fieldName + 'Enabled');
        }
        if (isValueModified && formData.get(fieldName + 'Enabled')) {
          field.value = formData.get(fieldName);
        }
      }
    });
    return data;
  },

  /**
   * @override
   */
  isValid() {
    const {
      formFieldsErrors,
      formFieldsModified: modified,
      formData,
      sourceFieldNames,
    } = this.getProperties(
      'formFieldsErrors',
      'formFieldsModified',
      'formData',
      'sourceFieldNames',
    );
    let isValid = true;
    sourceFieldNames.forEach(fieldName => {
      const isModified = modified.get(fieldName + 'Number') ||
        modified.get(fieldName + 'Enabled') ||
        modified.get(fieldName + 'Unit');
      if (formData.get(fieldName + 'Enabled') && isModified &&
        formFieldsErrors[fieldName]) {
        isValid = false;
      }
    });
    return isValid;
  },

  actions: {
    /**
     * @override
     */
    dataChanged(fieldName, value) {
      this.set('formData.' + fieldName, value);
      this.set('isDirty', true);
      this.set('formFieldsModified.' + fieldName, true);
      if (!_.endsWith(fieldName, 'Number') || this.get('lostInputFocus')) {
        this.scheduleSendChanges();
      }
      if (_.endsWith(fieldName, 'Enabled') && value) {
        const numberField =
          fieldName.substring(0, fieldName.length - 'Enabled'.length);
        run.next(() => {
          if (!this.isDestroyed && !this.isDestroying) {
            $(this.get('element'))
              .find(`#${this.get('elementId')}${numberField}`).focus();
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
  },
});
