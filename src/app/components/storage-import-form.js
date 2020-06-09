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
 *   storageImport: {
 *     strategy: 'simple_scan',
 *     maxDepth: 100,
 *   },
 *   storageUpdate: {
 *     strategy: 'simple_scan',
 *     maxDepth: 120,
 *     scanInterval: 100,
 *     writeOnce: true,
 *     deleteEnable: true,
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

const genericFields = [{
    name: 'importMode',
    type: 'radio-group',
    options: [{
      value: 'initial',
    }, {
      value: 'continuous',
    }],
    defaultValue: 'initial',
  }, {
    name: 'maxDepth',
    type: 'number',
    gte: 1,
    optional: true,
    example: '3',
  },
  {
    name: 'syncAcl',
    type: 'checkbox',
    optional: true,
  },
];

const continuousFields = [{
    name: 'scanInterval',
    type: 'number',
    gt: 0,
    example: '1000',
    defaultValue: '10',
  },
  {
    name: 'writeOnce',
    type: 'checkbox',
    optional: true,
  },
  {
    name: 'deleteEnable',
    type: 'checkbox',
    optional: true,
  },
];

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
  currentFieldsPrefix: computed('selectedImportMode', function currentFieldsPrefix() {
    const selectedImportMode = this.get('selectedImportMode');
    const prefixes = ['generic'];

    if (selectedImportMode === 'continuous') {
      prefixes.push('continuous');
    }

    return prefixes;
  }),

  /**
   * @type {ComputedProperty<String>}
   */
  selectedImportMode: reads('allFieldsValues.generic.importMode'),

  /**
   * @type {ComputedProperty<Array<FieldType>>}
   */
  genericFields: computed(() => genericFields.map(field =>
    EmberObject.create(field, {
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
  allFields: union('genericFields', 'continuousFields'),

  /**
   * @override
   */
  allFieldsValues: computed(
    'genericFields',
    'continuousFields',
    function allFieldsValues() {
      const {
        genericFields,
        continuousFields,
      } = this.getProperties('genericFields', 'continuousFields');

      const fields = EmberObject.create({
        generic: EmberObject.create(),
        continuous: EmberObject.create(),
      });

      [...genericFields, ...continuousFields].forEach(field => {
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

  init() {
    this._super(...arguments);

    this.prepareFields();
    this.addFieldsTranslations();
    next(() => {
      this.loadDefaultValues();
    });
  },

  didInsertElement() {
    this._super(...arguments);
    this.triggerValuesChanged();
  },

  addFieldsTranslations() {
    const {
      genericFields,
      continuousFields,
    } = this.getProperties('genericFields', 'continuousFields');

    [...genericFields, ...continuousFields].forEach(field => {
      const translationPrefix = `fields.${get(field, 'name')}`;
      setProperties(field, {
        label: this.t(`${translationPrefix}.name`),
        tip: this.t(`${translationPrefix}.tip`),
      });
    });

    const importModeOptions = get(
      genericFields.findBy('name', 'generic.importMode'),
      'options'
    );
    importModeOptions.forEach(option => {
      set(
        option,
        'label',
        this.t(`fields.generic.importMode.options.${get(option, 'value')}.name`)
      );
    });
  },

  loadDefaultValues() {
    const {
      genericFields,
      continuousFields,
      defaultValues,
    } = this.getProperties(
      'genericFields',
      'continuousFields',
      'defaultValues'
    );

    if (defaultValues) {
      const isUpdateEnabled =
        get(defaultValues, 'storageUpdate.strategy') === 'simple_scan';

      const importModeField = genericFields.findBy('name', 'generic.importMode');
      set(importModeField,
        'defaultValue',
        isUpdateEnabled ? 'continuous' : 'initial'
      );

      genericFields
        .without(importModeField)
        .forEach(field => {
          const fieldName = get(field, 'name');
          const value = get(
            defaultValues,
            `storage${isUpdateEnabled ? 'Update' : 'Import'}.${this.cutOffPrefix(fieldName)}`
          );
          set(field, 'defaultValue', value);
        });

      continuousFields
        .forEach(field => {
          const fieldName = get(field, 'name');
          const value = get(
            defaultValues,
            `storageUpdate.${this.cutOffPrefix(fieldName)}`
          );
          set(field, 'defaultValue', value);
        });
    }

    this.resetFormValues(['generic', 'continuous']);

    this.triggerValuesChanged();
  },

  getValues() {
    const {
      selectedImportMode,
      formValues,
      currentFields,
      mode,
    } = this.getProperties(
      'selectedImportMode',
      'formValues',
      'currentFields',
      'mode'
    );

    const isUpdateEnabled = selectedImportMode === 'continuous';

    const formData = {
      storageUpdate: {
        strategy: isUpdateEnabled ? 'simple_scan' : 'no_update',
      },
    };
    if (mode === 'new') {
      formData.storageImport = {
        strategy: 'simple_scan',
      };
    }

    currentFields.rejectBy('name', 'generic.importMode').forEach(({ name }) => {
      const formValue = formValues.get(name);
      if (formValue === undefined || formValue === '' || formValue === null) {
        return;
      }
      const nameWithoutPrefix = this.cutOffPrefix(name);
      if (mode === 'new' && name.startsWith('generic.')) {
        formData.storageImport[nameWithoutPrefix] = formValue;
      }
      if (isUpdateEnabled) {
        formData.storageUpdate[nameWithoutPrefix] = formValue;
      }
    });
    return formData;
  },

  triggerValuesChanged() {
    const {
      allFields,
      selectedImportMode,
      mode,
      valuesChanged,
    } = this.getProperties(
      'allFields',
      'selectedImportMode',
      'mode',
      'valuesChanged'
    );

    const genericFieldsWithoutMode = allFields
      .filter(field => get(field, 'name').startsWith('generic.'))
      .rejectBy('name', 'generic.importMode');
    if (mode === 'edit' && selectedImportMode === 'initial') {
      genericFieldsWithoutMode.forEach(field => {
        this.set(`allFieldsValues.${get(field, 'name')}`, get(field, 'defaultValue'));
        this._resetField(field);
        set(field, 'disabled', true);
      });
    } else {
      genericFieldsWithoutMode.setEach('disabled', false);
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
