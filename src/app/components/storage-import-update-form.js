/**
 * A form component for import/update configuration of storage.
 * It can work in two modes (mode property):
 * - new - intended to be a part of the support space form. It doesn't have 
 * a header and a submit button.
 * - edit - standalone form component (with a header and a submit button).
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
 * @module components/storage-import-update-form
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import { invokeAction } from 'ember-invoke-action';
import { buildValidations } from 'ember-cp-validations';
import _object from 'lodash/object';
import _find from 'lodash/find';

import OneForm from 'onepanel-gui/components/one-form';
import createFieldValidator from 'onepanel-gui/utils/create-field-validator';
import stripObject from 'onepanel-gui/utils/strip-object';

const {
  computed,
  computed: {
    equal,
  },
  observer,
  inject: {
    service,
  },
} = Ember;

const IMPORT_GENERIC_FIELDS = [
  {
    name: 'maxDepth',
    type: 'number',
    gte: 1,
    optional: true,
    example: '3',
  }
];

const IMPORT_STRATEGIES = [
  {
    id: 'simple_scan',
    fields: []
  }
];

const UPDATE_GENERIC_FIELDS = [
  {
    name: 'maxDepth',
    type: 'number',
    gte: 1,
    optional: true,
    example: '3',
  },
  {
    name: 'scanInterval',
    type: 'number',
    gt: 0,
    example: '1000',
    optional: true,
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
  }
];

const UPDATE_STRATEGIES = [
  {
    id: 'no_update',
    fields: []
  },
  {
    id: 'simple_scan',
    fields: []
  }
];

function createValidations(importGenericFields, importStrategies, 
  updateGenericFields, updateStrategies) {
  let validations = {};
  importStrategies.forEach(strategy => {
    strategy.fields.forEach(field => {
      let fieldName = 'allFieldsValues.import_' + strategy.id + '.' + field.name;
      validations[fieldName] = createFieldValidator(field);
    });
  });
  updateStrategies.forEach(strategy => {
    strategy.fields.forEach(field => {
      let fieldName = 'allFieldsValues.update_' + strategy.id + '.' + field.name;
      validations[fieldName] = createFieldValidator(field);
    });
  });
  importGenericFields.forEach(field => {
    let fieldName = 'allFieldsValues.import_generic.' + field.name;
    validations[fieldName] = createFieldValidator(field);
  });
  updateGenericFields.forEach(field => {
    let fieldName = 'allFieldsValues.update_generic.' + field.name;
    validations[fieldName] = createFieldValidator(field);
  });
  return validations;
}

const Validations = buildValidations(createValidations(IMPORT_GENERIC_FIELDS, 
  IMPORT_STRATEGIES, UPDATE_GENERIC_FIELDS, UPDATE_STRATEGIES));

export default OneForm.extend(Validations, {
  classNames: ['storage-import-update-form'],

  i18n: service(),

  /**
   * If true, form is visible to user
   * @type {boolean}
   */
  isFormOpened: false,

  /**
   * To inject. One of: edit, new
   *
   * Use to set form to work in various contexts
   * @type {string}
   */
  mode: 'edit',

  /**
   * Default form values
   * @type {Object}
   */
  defaultValues: null,

  unknownFieldErrorMsg: 'component:storage-import-update-form: attempt to change not known input type',
  currentFieldsPrefix: computed('selectedImportStrategy.id', 
    'selectedUpdateStrategy.id', 'mode', function () {
    let {
        selectedImportStrategy,
        selectedUpdateStrategy,
        updateStrategies,
        mode,
      } = this.getProperties(
        'selectedImportStrategy',
        'selectedUpdateStrategy',
        'updateStrategies',
        'mode'
      );
    let prefixes = mode === 'new' ? ['import_generic', 'import_' + selectedImportStrategy.id] : [];
    let noUpdateStrategy = _find(updateStrategies, { id:  'no_update' });
    if (selectedUpdateStrategy !== noUpdateStrategy) {
      prefixes = prefixes.concat(['update_generic', 'update_' + selectedUpdateStrategy.id]);
    }
    return prefixes;
  }),

  importGenericFields: computed(() => IMPORT_GENERIC_FIELDS.map(field => Ember.Object.create(field))),
  updateGenericFields: computed(() => UPDATE_GENERIC_FIELDS.map(field => Ember.Object.create(field))),
  importStrategies: computed(() => IMPORT_STRATEGIES.map(strategy => _object.assign({}, strategy))),
  updateStrategies: computed(() => UPDATE_STRATEGIES.map(strategy => _object.assign({}, strategy))),

  /**
   * Selected import strategy
   * @type {Ember.Object}
   */
  selectedImportStrategy: null,

  /**
   * Selected update strategy
   * @type {Ember.Object}
   */
  selectedUpdateStrategy: null,

  allFields: computed('importGenericFields', 'updateGenericFields', 
  'importStrategies.@each.fields', 'updateStrategies.@each.fields', function () {
    let {
      importGenericFields,
      updateGenericFields,
      importStrategies,
      updateStrategies,
    } = this.getProperties('importGenericFields', 'updateGenericFields', 
      'importStrategies', 'updateStrategies');
    return importStrategies
      .concat(updateStrategies)
      .concat({ fields: importGenericFields })
      .concat({ fields: updateGenericFields })
      .map(type => type.fields)
      .reduce((a, b) => a.concat(b));
  }),

  allFieldsValues: computed('importGenericFields', 'updateGenericFields', 
    'importStrategies', 'updateStrategies', function () {
    let {
      importGenericFields,
      updateGenericFields,
      importStrategies,
      updateStrategies,
    } = this.getProperties('importGenericFields', 'updateGenericFields', 
      'importStrategies', 'updateStrategies');
    let fields = Ember.Object.create({
      import_generic: Ember.Object.create({}),
      update_generic: Ember.Object.create({})
    });
    importStrategies.forEach(type => {
      fields.set('import_' + type.id, Ember.Object.create({}));
      type.fields.forEach(field => {
        fields.set(field.get('name'), null);
      });
    });
    updateStrategies.forEach(type => {
      fields.set('update_' + type.id, Ember.Object.create({}));
      type.fields.forEach(field => {
        fields.set(field.get('name'), null);
      });
    });
    importGenericFields.concat(updateGenericFields).forEach(field => {
      fields.set(field.get('name'), null);
    });
    return fields;
  }),

  /**
   * Fields for "import" form part
   * @type {computed.Array.Ember.Object}
   */
  currentImportFields: computed('currentFields', function () {
    return this.get('currentFields').filter(field => field.get('name').startsWith('import_'));
  }),

  /**
   * Fields for "update" form part
   * @type {computed.Array.Ember.Object}
   */
  currentUpdateFields: computed('currentFields', function () {
    return this.get('currentFields').filter(field => field.get('name').startsWith('update_'));
  }),

  /**
   * Is submit button visible?
   * @type {computed.boolean}
   */
  showSubmitButton: true,

  /**
   * Loads new default values
   */
  defaultValuesObserver: observer('defaultValues', function () {
    this._loadDefaultValues();
  }),

  /**
   * Resets field if form visibility changes (clears validation errors)
   */
  isFormOpenedObserver: observer('isFormOpened', function () {
    this._loadDefaultValues();
  }),

  init() {
    this._super(...arguments);
    if (this.get('selectedImportStrategy') === null) {
      this.set('selectedImportStrategy', this.get('importStrategies.firstObject'));
    }
    if (this.get('selectedUpdateStrategy') === null) {
      this.set('selectedUpdateStrategy', this.get('updateStrategies.firstObject'));
    }
    this.get('importGenericFields').forEach(field => field.set('name', 'import_generic.' + field.get('name')));
    this.get('updateGenericFields').forEach(field => field.set('name', 'update_generic.' + field.get('name')));
    this.get('importStrategies').forEach(strategy => {
      strategy.fields = strategy.fields.map(field => Ember.Object.create(field));
      strategy.fields.forEach(field => field.set('name', 'import_' + strategy.id + '.' + field.get('name')));
    });
    this.get('updateStrategies').forEach(strategy => {
      strategy.fields = strategy.fields.map(field => Ember.Object.create(field));
      strategy.fields.forEach(field => field.set('name', 'update_' + strategy.id + '.' + field.get('name')));
    });
    this.prepareFields();
    this._addFieldsTranslations();
    this._loadDefaultValues();
  },

  didInsertElement() {
    this._super(...arguments);
    this._triggerValuesChanged();
  },

  _addFieldsTranslations() {
    let i18n = this.get('i18n');
    let {
      importGenericFields,
      updateGenericFields,
      importStrategies, 
      updateStrategies
    } = this.getProperties('importGenericFields', 
      'updateGenericFields', 'importStrategies', 'updateStrategies');
      
    importGenericFields.forEach(field =>
      this._addFieldTranslation('storageImport', field, i18n)
    );
    importStrategies.forEach(strategy => {
      strategy.fields.forEach(field =>
        this._addFieldTranslation('storageImport', field, i18n));
      this._addStrategyNameTranslation('storageImport', strategy, i18n);
    });
    updateGenericFields.forEach(field =>
      this._addFieldTranslation('storageUpdate', field, i18n)
    );
    updateStrategies.forEach(strategy => {
      strategy.fields.forEach(field =>
        this._addFieldTranslation('storageUpdate', field, i18n));
      this._addStrategyNameTranslation('storageUpdate', strategy, i18n);
    });
  },

  _addFieldTranslation(path, field, i18n) {
    let fieldTranslationPrefix = 
      `components.storageImportUpdateForm.${path}.${this.cutOffPrefix(field.get('name'))}`;
    if (!field.get('label')) {
      field.set('label', i18n.t(fieldTranslationPrefix + '.name'));
    }
    field.set('tip', i18n.t(fieldTranslationPrefix + '.tip'));
  },

  _addStrategyNameTranslation(path, strategy, i18n) {
    strategy.name = i18n.t(
      `components.storageImportUpdateForm.${path}.strategies.${strategy.id}`
    );
  },

  _loadDefaultValues() {
    let {
      defaultValues,
      importGenericFields,
      updateGenericFields,
      importStrategies, 
      updateStrategies
    } = this.getProperties('defaultValues', 'importGenericFields', 
      'updateGenericFields', 'importStrategies', 'updateStrategies');

    this.resetFormValues();

    if (defaultValues) {
      defaultValues = Ember.Object.create(defaultValues);
      let selectedImportStrategy = 
        _find(importStrategies, { id:  defaultValues.get('storageImport.strategy') }) || 
        importStrategies[0];
      let selectedUpdateStrategy = 
        _find(updateStrategies, { id:  defaultValues.get('storageUpdate.strategy') }) ||
        _find(updateStrategies, { id:  'no_update' });
      this.set('selectedImportStrategy', selectedImportStrategy);
      this.set('selectedUpdateStrategy', selectedUpdateStrategy);

      importGenericFields.concat(selectedImportStrategy.fields)
        .forEach(({name}) => 
          this.set(`allFieldsValues.${name}`, 
            defaultValues.get(`storageImport.${this.cutOffPrefix(name)}`))
      );
      updateGenericFields.concat(selectedUpdateStrategy.fields)
        .forEach(({name}) => 
          this.set(`allFieldsValues.${name}`, 
            defaultValues.get(`storageUpdate.${this.cutOffPrefix(name)}`))
      );
    }
    this._triggerValuesChanged();
  },

  _getValues() {
    let {
      formValues,
      currentFields,
      selectedImportStrategy,
      selectedUpdateStrategy,
      mode
    } = this.getProperties(
      'formValues',
      'currentFields',
      'selectedImportStrategy',
      'selectedUpdateStrategy',
      'mode'
    );

    let formData = {
      storageUpdate: {
        strategy: selectedUpdateStrategy.id
      },
    };
    if (mode === 'new') {
      formData.storageImport = {
        strategy: selectedImportStrategy.id
      };
    }

    currentFields.forEach(({ name }) => {
      let nameWithoutPrefix = this.cutOffPrefix(name);
      if (mode === 'new' && name.startsWith('import_')) {
        formData.storageImport[nameWithoutPrefix] = formValues.get(name);
      }
      if (name.startsWith('update_')) {
        formData.storageUpdate[nameWithoutPrefix] = formValues.get(name);
      }
    });
    return formData;
  },

  _triggerValuesChanged() {
    return invokeAction(this, 'valuesChanged', this._getValues(), this.get('isValid'));
  },

  resetFormValues() {
    let {
      importStrategies, 
      updateStrategies
    } = this.getProperties('importStrategies', 'updateStrategies');
    this._super(...arguments);
    this.set('selectedImportStrategy', importStrategies[0]);
    this.set('selectedUpdateStrategy', 
      _find(updateStrategies, { id:  'no_update' }));
  },

  actions: {
    importStrategyChanged(strategy) {
      this.resetFormValues(['import_generic', 'import_' + strategy.id]);
      this.set('selectedImportStrategy', strategy);
      return this._triggerValuesChanged();
    },

    updateStrategyChanged(strategy) {
      this.resetFormValues(['update_generic', 'update_' + strategy.id]);
      this.set('selectedUpdateStrategy', strategy);
      return this._triggerValuesChanged();
    },

    inputChanged(fieldName, value) {
      this.changeFormValue(fieldName, value);
      return this._triggerValuesChanged();
    },

    focusOut(field) {
      field.set('changed', true);
      this.recalculateErrors();
    },

    submit() {
      return invokeAction(this, 'submit', stripObject(this._getValues(), [undefined, null, '']));
    },
  }
});
