/**
 * A form component for import configuration of storage.
 * It can work in two modes (mode property):
 * - new - intended to be a part of the support space form. It doesn't have 
 * a header and a submit button.
 * - edit - emergency form component (with a header and a submit button).
 * For both of them defaultValues can be set (through defaultValues property).
 * 
 * Example of defaultValues object (submit result has the same format):
 * ```
 * {
 *   mode: 'auto',
 *   autoStorageImportConfig: {
 *     continuousScan: true,
 *     maxDepth: 120,
 *     scanInterval: 100,
 *     detectModifications: true,
 *     detectDeletions: true,
 *   }
 * }
 * ```
 *
 * @module components/storage-import-form
 * @author Michał Borzęcki
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { inject as service } from '@ember/service';
import EmberObject, {
  get,
  getProperties,
  set,
  setProperties,
  observer,
  computed,
} from '@ember/object';
import { buildValidations } from 'ember-cp-validations';
import { reads, union } from '@ember/object/computed';
import OneForm from 'onedata-gui-common/components/one-form';
import createFieldValidator from 'onedata-gui-common/utils/create-field-validator';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { next } from '@ember/runloop';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';
import { equal, raw } from 'ember-awesome-macros';
import _ from 'lodash';

const modeField = {
  name: 'mode',
  type: 'radio-group',
  options: [{
    value: 'auto',
  }, {
    value: 'manual',
  }],
  defaultValue: 'auto',
  tip: true,
};

const genericFields = [{
  name: 'continuousScan',
  type: 'checkbox',
  defaultValue: true,
}, {
  name: 'maxDepth',
  type: 'number',
  gte: 1,
  optional: true,
  example: '3',
}, {
  name: 'syncAcl',
  type: 'checkbox',
  defaultValue: false,
  optional: true,
}];

const continuousFields = [{
  name: 'scanInterval',
  type: 'number',
  gt: 0,
  example: '1000',
  defaultValue: '60',
}, {
  name: 'detectModifications',
  type: 'checkbox',
  defaultValue: true,
  optional: true,
}, {
  name: 'detectDeletions',
  type: 'checkbox',
  defaultValue: true,
  optional: true,
}];

function createValidations(genericFields, continuousFields) {
  let validations = {};
  genericFields.forEach(field => {
    let fieldName = 'allFieldsValues.generic.' + field.name;
    validations[fieldName] = createFieldValidator(field);
  });
  continuousFields.forEach(field => {
    let fieldName = 'allFieldsValues.continuous.' + field.name;
    validations[fieldName] = createFieldValidator(field);
  });
  return validations;
}

const Validations = buildValidations(createValidations(
  genericFields,
  continuousFields
));

export const fields = {
  mode: [modeField],
  generic: genericFields,
  continuous: continuousFields,
};

export default OneForm.extend(I18n, Validations, {
  classNames: ['storage-import-form'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.storageImportForm',

  /**
   * If true, form is visible to user
   * @virtual
   * @type {boolean}
   */
  isFormOpened: false,

  /**
   * One of: edit, new
   * Use to set form to work in various contexts
   * @virtual optional
   * @type {string}
   */
  mode: 'edit',

  /**
   * Default form values
   * @virtual optional
   * @type {Object|Ember.Object}
   */
  defaultValues: null,

  /**
   * Is submit button visible?
   * @virtual optional
   * @type {boolean}
   */
  showSubmitButton: true,

  /**
   * @virtual optional
   * @type {Function}
   * @param {Object} values form values dump
   * @param {boolean} isValid
   * @returns {any}
   */
  valuesChanged: notImplementedIgnore,

  /**
   * @virtual optional
   * @type {Function}
   * @param {Object} values form values dump
   * @returns {Promise}
   */
  submit: notImplementedReject,

  /**
   * @override
   */
  currentFieldsPrefix: computed(
    'autoImportEnabled',
    'continuousScanEnabled',
    function currentFieldsPrefix() {
      const {
        autoImportEnabled,
        continuousScanEnabled,
      } = this.getProperties('autoImportEnabled', 'continuousScanEnabled');
      const prefixes = ['mode'];

      if (autoImportEnabled) {
        prefixes.push('generic');

        if (continuousScanEnabled) {
          prefixes.push('continuous');
        }
      }

      return prefixes;
    }
  ),

  /**
   * @type {ComputedProperty<String>}
   */
  autoImportEnabled: equal('allFieldsValues.mode.mode', raw('auto')),

  /**
   * @type {ComputedProperty<String>}
   */
  continuousScanEnabled: reads('allFieldsValues.generic.continuousScan'),

  /**
   * @type {ComputedProperty<Array<FieldType>>}
   */
  modeFields: computed(() => [EmberObject.create(modeField, {
    name: `mode.${modeField.name}`,
  })]),

  /**
   * @type {ComputedProperty<Array<FieldType>>}
   */
  genericFields: computed(() => genericFields.map(field =>
    EmberObject.create(_.cloneDeep(field), {
      name: `generic.${field.name}`,
    })
  )),

  /**
   * @type {ComputedProperty<Array<FieldType>>}
   */
  continuousFields: computed(() => continuousFields.map(field =>
    EmberObject.create(field, {
      name: `continuous.${field.name}`,
    })
  )),

  /**
   * @override
   */
  allFields: union('modeFields', 'genericFields', 'continuousFields'),

  /**
   * @override
   */
  allFieldsValues: computed(
    'genericFields',
    'continuousFields',
    function allFieldsValues() {
      const {
        modeFields,
        genericFields,
        continuousFields,
      } = this.getProperties('modeFields', 'genericFields', 'continuousFields');

      const fields = EmberObject.create({
        mode: EmberObject.create(),
        generic: EmberObject.create(),
        continuous: EmberObject.create(),
      });

      [...modeFields, ...genericFields, ...continuousFields].forEach(field => {
        fields.set(field.get('name'), null);
      });

      return fields;
    }
  ),

  /**
   * Loads new default values
   */
  defaultValuesObserver: observer('defaultValues', function defaultValuesObserver() {
    this.loadDefaultValues();
  }),

  /**
   * Resets field if form visibility changes (clears validation errors)
   */
  isFormOpenedObserver: observer('isFormOpened', function isFormOpenedObserver() {
    this.loadDefaultValues();
  }),

  /**
   * Blocks "mode" field depending on form mode
   */
  modeObserver: observer('mode', function modeObserver() {
    const modeField = this.getField('mode.mode');
    const isInEditMode = this.get('mode') === 'edit';
    set(modeField, 'disabled', isInEditMode);
  }),

  init() {
    this._super(...arguments);

    this.prepareFields();
    this.addFieldsTranslations();
    this.modeObserver();
    next(() => {
      this.loadDefaultValues();
    });
  },

  addFieldsTranslations() {
    const {
      modeFields,
      genericFields,
      continuousFields,
    } = this.getProperties('modeFields', 'genericFields', 'continuousFields');

    [...modeFields, ...genericFields, ...continuousFields].forEach(field => {
      const {
        name,
        options,
      } = getProperties(field, 'name', 'options');

      const translationPrefix = `fields.${name}`;
      setProperties(field, {
        label: this.t(`${translationPrefix}.name`),
        tip: this.t(`${translationPrefix}.tip`),
      });
      if (options) {
        options.forEach(option =>
          set(option, 'label', this.t(`${translationPrefix}.options.${option.value}`))
        );
      }
    });
  },

  loadDefaultValues() {
    const {
      modeFields,
      genericFields,
      continuousFields,
      defaultValues,
    } = this.getProperties(
      'modeFields',
      'genericFields',
      'continuousFields',
      'defaultValues'
    );

    if (defaultValues) {
      const inAutoMode = get(defaultValues, 'mode') === 'auto';
      set(modeFields[0], 'defaultValue', inAutoMode ? 'auto' : 'manual');

      if (inAutoMode) {
        genericFields
          .forEach(field => {
            const fieldName = get(field, 'name');
            const value = get(
              defaultValues,
              `autoStorageImportConfig.${this.cutOffPrefix(fieldName)}`
            );
            set(field, 'defaultValue', value);
          });

        const continuousScanEnabled =
          get(defaultValues, 'autoStorageImportConfig.continuousScan');
        continuousFields
          .forEach(field => {
            const {
              name: fieldName,
              defaultValue,
            } = getProperties(field, 'name', 'defaultValue');
            const value = continuousScanEnabled ? get(
              defaultValues,
              `autoStorageImportConfig.${this.cutOffPrefix(fieldName)}`
            ) : defaultValue;
            set(field, 'defaultValue', value);
          });
      }
    }

    this.resetFormValues(['mode', 'generic', 'continuous']);

    this.triggerValuesChanged();
  },

  getValues() {
    const {
      autoImportEnabled,
      formValues,
      currentFields,
      mode,
    } = this.getProperties(
      'autoImportEnabled',
      'formValues',
      'currentFields',
      'mode',
    );

    const formData = {
      mode: autoImportEnabled ? 'auto' : 'manual',
    };

    const autoStorageImportConfig = {};
    if (autoImportEnabled) {
      currentFields.rejectBy('name', 'mode.mode').forEach(({ name }) => {
        const formValue = formValues.get(name);
        if (formValue === undefined || formValue === '' || formValue === null) {
          return;
        }
        const nameWithoutPrefix = this.cutOffPrefix(name);
        autoStorageImportConfig[nameWithoutPrefix] = formValue;
      });

      if (mode === 'edit') {
        // in edit mode only auto import config is being sent
        return autoStorageImportConfig;
      } else {
        formData.autoStorageImportConfig = autoStorageImportConfig;
      }
    }
    return formData;
  },

  triggerValuesChanged() {
    const {
      allFields,
      continuousScanEnabled,
      mode,
      valuesChanged,
    } = this.getProperties(
      'allFields',
      'continuousScanEnabled',
      'mode',
      'valuesChanged'
    );

    const genericFieldsWithoutContinuousImport = allFields
      .filter(field => get(field, 'name').startsWith('generic.'))
      .rejectBy('name', 'generic.continuousScan');
    if (mode === 'edit' && !continuousScanEnabled) {
      genericFieldsWithoutContinuousImport.forEach(field => {
        this.set(`allFieldsValues.${get(field, 'name')}`, get(field, 'defaultValue'));
        this._resetField(field);
        set(field, 'disabled', true);
      });
    } else {
      genericFieldsWithoutContinuousImport.setEach('disabled', false);
    }

    return valuesChanged(this.getValues(), this.get('isValid'));
  },

  actions: {
    inputChanged(fieldName, value) {
      this.changeFormValue(fieldName, value);
      return this.triggerValuesChanged();
    },

    focusOut(field) {
      field.set('changed', true);
      this.recalculateErrors();
    },

    submit() {
      return this.get('submit')(this.getValues());
    },
  },
});
