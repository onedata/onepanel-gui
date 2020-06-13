/**
 * A form for adding new and modifying existing storage with all storage types
 * available.
 *
 * @module components/cluster-storage-add-form
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { run } from '@ember/runloop';

import EmberObject, { observer, computed, set, get, setProperties } from '@ember/object';
import { equal, union } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { invoke } from 'ember-invoke-action';
import { buildValidations } from 'ember-cp-validations';
import _ from 'lodash';
import config from 'ember-get-config';
import notImplementedThrow from 'onedata-gui-common/utils/not-implemented-throw';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import { resolve } from 'rsvp';
import { promise, raw, writable } from 'ember-awesome-macros';

import stripObject from 'onedata-gui-common/utils/strip-object';
import OneForm from 'onedata-gui-common/components/one-form';
import storageTypes from 'onepanel-gui/utils/cluster-storage/storage-types';
import GENERIC_FIELDS from 'onepanel-gui/utils/cluster-storage/generic-fields';
import LUMA_FIELDS from 'onepanel-gui/utils/cluster-storage/luma-fields';
import createFieldValidator from 'onedata-gui-common/utils/create-field-validator';

const {
  layoutConfig,
} = config;

/**
 * Analyzes all field validators dependencies (dependent fields) and replaces
 * prefixes in their names according to given values.
 * @param {FieldType} field
 * @param {string} prefix
 * @param {string} newPrefix
 * @returns {FieldType}
 */
function replaceDependencyPrefix(field, prefix, newPrefix) {
  ['lt', 'lte', 'gt', 'gte'].forEach(validatorName => {
    const validator = get(field, validatorName);
    if (validator && typeof validator === 'object') {
      const propertyName = get(validator, 'property');
      if (_.startsWith(propertyName, prefix + '.')) {
        const prefixlessPropertyName =
          propertyName.substring(get(prefix, 'length') + 1);
        set(validator, 'property', `${newPrefix}.${prefixlessPropertyName}`);
      }
    }
  });
  return field;
}

function createValidations(storageTypes, genericFields, lumaFields) {
  const validations = {};
  storageTypes.forEach(type => {
    type.fields.forEach(field => {
      const validator = createFieldValidator(field);
      const prefixedField = replaceDependencyPrefix(
        _.cloneDeep(field),
        type.id,
        type.id + '_editor'
      );
      const editorValidator = createFieldValidator(field);
      validations['allFieldsValues.' + type.id + '.' + prefixedField.name] =
        validator;
      validations['allFieldsValues.' + type.id + '_editor.' + prefixedField.name] =
        editorValidator;
    });
  });
  genericFields.forEach(field => {
    const validator = createFieldValidator(field);
    validations['allFieldsValues.generic.' + field.name] = validator;
    validations['allFieldsValues.generic_editor.' + field.name] = validator;
  });

  lumaFields.forEach(field => {
    const validator = createFieldValidator(field);
    validations['allFieldsValues.luma.' + field.name] = validator;
    validations['allFieldsValues.luma_editor.' + field.name] = validator;
  });
  return validations;
}

const Validations = buildValidations(createValidations(
  storageTypes, GENERIC_FIELDS, LUMA_FIELDS));

const VISIBILITY_ANIMATION_TIME = 333;

const storagePathTypeDefaults = {
  posix: 'canonical',
  glusterfs: 'canonical',
  nulldevice: 'canonical',
  ceph: 'flat',
  cephrados: 'flat',
  localceph: 'flat',
  s3: 'flat',
  swift: 'flat',
  webdav: 'canonical',
};

const storagesWithImport = [
  'posix',
];

export default OneForm.extend(I18n, Validations, {
  classNames: ['cluster-storage-add-form'],
  classNameBindings: [
    'inShowMode:form-static',
    'showLoadingSpinner:is-loading',
  ],

  i18n: service(),
  cephManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.clusterStorageAddForm',

  /**
   * @override
   */
  unknownFieldErrorMsg: 'component:cluster-storage-add-form: attempt to change not known input type',

  /**
   * Storage to show/edit
   * @virtual optional
   * @type {Onepanel.StorageDetails}
   */
  storage: null,

  /**
   * Form mode. Available values: create, edit, show
   * @virtual optional
   * @type {string}
   */
  mode: 'create',

  /**
   * If true, form is visible to user
   * @virtual optional
   * @type {boolean}
   */
  isFormOpened: false,

  /**
   * If true, then edited storage already supports some spaces.
   * @virtual optional
   * @type {boolean}
   */
  storageProvidesSupport: false,

  /**
   * @type {boolean}
   */
  disableStorageTypeSelector: false,

  /**
   * Called when user clicks "Cancel" button in edit mode
   * @virtual optional
   * @type {function}
   * @returns {any}
   */
  cancel: notImplementedThrow,

  /**
   * Set on init
   * @type {Array<FieldType>}
   */
  genericFields: undefined,

  /**
   * Set on init
   * @type {Array<FieldType>}
   */
  lumaFields: null,

  /**
   * Set on init
   * @type {Array<FieldType>}
   */
  staticFields: undefined,

  /**
   * Set on init
   * @type {Array<FieldType>}
   */
  editorFields: undefined,

  /**
   * @type {boolean}
   */
  showLumaPrefix: false,

  /**
   * @type {number}
   */
  showLumaPrefixTimeoutId: -1,

  /**
   * Form layout config
   * @type {Object}
   */
  layoutConfig,

  /**
   * If true, shows loading spinner on top of the form (overlay)
   * @type {boolean}
   */
  showLoadingSpinner: false,

  /**
   * @type {boolean}
   */
  modifyModalVisible: false,

  /**
   * @type {boolean}
   */
  areQosParamsValid: true,

  /**
   * @type {Object}
   */
  editedQosParams: undefined,

  /**
   * @type {boolean}
   */
  isSavingStorage: false,

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  inEditionMode: equal('mode', 'edit'),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  inShowMode: equal('mode', 'show'),

  /**
   * @type {Ember.ComputedProperty<Array<Object>>}
   */
  storageTypes: computed(() => storageTypes.map(type => _.assign({}, type))),

  /**
   * @type {Object}
   */
  selectedStorageType: undefined,

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  storageHasQosParameters: computed(
    'storage.qosParameters',
    function storageHasQosParameters() {
      const qosParams = this.get('storage.qosParameters');
      return !qosParams || Boolean(get(Object.keys(qosParams), 'length'));
    }
  ),

  /**
   * @override
   */
  currentFieldsPrefix: computed(
    'selectedStorageType.id',
    'mode',
    'lumaPrefixVisible',
    function currentFieldsPrefix() {
      const {
        selectedStorageType,
        mode,
        lumaPrefixVisible,
      } = this.getProperties('selectedStorageType', 'mode', 'lumaPrefixVisible');
      if (mode === 'show') {
        return ['meta', 'type_static', 'generic_static']
          .concat(lumaPrefixVisible ? ['luma_static'] : [])
          .concat(selectedStorageType ? [selectedStorageType.id + '_static'] : []);
      } else if (mode === 'edit') {
        return ['meta', 'type_static', 'generic_editor']
          .concat(lumaPrefixVisible ? ['luma_editor'] : [])
          .concat(selectedStorageType ? [selectedStorageType.id + '_editor'] : []);
      } else {
        return ['meta', 'generic']
          .concat(lumaPrefixVisible ? ['luma'] : [])
          .concat(selectedStorageType ? [selectedStorageType.id] : []);
      }
    }
  ),

  /**
   * @override
   */
  allFields: union(
    'createFields',
    'staticFields',
    'editorFields',
    'storageTypeStaticField'
  ),

  /**
   * @type {Ember.ComputedProperty<Array<FieldType>>}
   */
  storageTypeStaticField: computed(function storageTypeStaticField() {
    return [EmberObject.create({
      name: 'type_static.type',
      type: 'static',
      label: this.t('storageType'),
    })];
  }),

  /**
   * @type {Ember.ComputedProperty<Array<FieldType>>}
   */
  createFields: computed(
    'storageTypes.@each.fields',
    'genericFields',
    'lumaFields',
    function createFields() {
      const {
        storageTypes,
        lumaFields,
        genericFields,
      } = this.getProperties('storageTypes', 'lumaFields', 'genericFields');
      return storageTypes
        .concat([{ fields: genericFields }, { fields: lumaFields }])
        .map(type => type.fields)
        .reduce((a, b) => a.concat(b));
    }
  ),

  /**
   * @override
   */
  allFieldsValues: computed(
    'genericFields',
    'lumaFields',
    'storageTypes',
    function allFieldsValues() {
      const {
        storageTypes,
        allFields,
      } = this.getProperties('storageTypes', 'allFields');
      const values = EmberObject.create();
      [
        'meta',
        'type_static',
        'generic',
        'generic_static',
        'generic_editor',
        'luma',
        'luma_static',
        'luma_editor',
      ].forEach(prefix => set(values, prefix, EmberObject.create()));

      storageTypes.forEach(type => {
        values.set(type.id, EmberObject.create());
        values.set(type.id + '_static', EmberObject.create());
        values.set(type.id + '_editor', EmberObject.create());
      });
      allFields.forEach(field => values.set(get(field, 'name'), null));
      return values;
    }
  ),

  /**
   * Is true if luma has been enabled by user interaction
   * @type {Ember.ComputedProperty<boolean>}
   */
  lumaEnabledByEdition: computed(
    'allFieldsValues.generic_editor.lumaEnabled',
    function lumaEnabledByEdition() {
      const lumaEnabledValue =
        this.get('allFieldsValues.generic_editor.lumaEnabled');
      const lumaEnabledField =
        this.get('allFields').findBy('name', 'generic_editor.lumaEnabled');
      return lumaEnabledValue && get(lumaEnabledField, 'changed');
    }
  ),

  /**
   * @override
   */
  isValid: computed(
    'errors.[]',
    'inEditionMode',
    'lumaEnabledByEdition',
    'areQosParamsValid',
    function isValid() {
      const {
        areQosParamsValid,
        errors,
        inEditionMode,
        lumaEnabledByEdition,
      } = this.getProperties(
        'areQosParamsValid',
        'errors',
        'inEditionMode',
        'lumaEnabledByEdition'
      );

      if (!areQosParamsValid) {
        return false;
      } else if (inEditionMode) {
        // If luma has been enabled but luma fields are invalid, then the whole
        // form is invalid
        if (lumaEnabledByEdition) {
          const lumaErrors = errors.filter(error =>
            _.startsWith(get(error, 'attribute'), 'allFieldsValues.luma_editor.')
          );
          if (get(lumaErrors, 'length')) {
            return false;
          }
        }

        // If all errors are because of null values, then everything is alright
        // - empty value means no modification
        return errors.reduce((onlyEmpty, { attribute }) => {
          const value = this.get(attribute);
          return onlyEmpty && (value === undefined || value === null);
        }, true);
      } else {
        return errors.length === 0;
      }
    }
  ),

  /**
   * Will be set in init()
   * @type {Ember.ComputedProperty<PromiseArray<Onepanel.CephOsd>>}
   */
  cephOsdsProxy: writable(promise.array(raw(resolve([])))),

  /**
   * @type {Ember.ComputedProperty<Array<Object>>}
   */
  visibleStorageTypes: computed(
    'storageTypes.[]',
    'cephOsdsProxy.length',
    function visibleStorageTypes() {
      // Remove ceph storage, because it is deprecated
      let visibleTypes = this.get('storageTypes').rejectBy('id', 'ceph');
      // If no osds are present, remove localceph storage type
      if (!this.get('cephOsdsProxy.length')) {
        visibleTypes = visibleTypes.rejectBy('id', 'localceph');
      }

      return visibleTypes;
    }
  ),

  /**
   * @returns {ComputedProperty<boolean>}
   */
  storageSupportsImport: computed(
    'selectedStorageType.id',
    function storageSupportsImport() {
      const storageTypeName = this.get('selectedStorageType.id');
      return storagesWithImport.includes(storageTypeName);
    }
  ),

  osdsNumberObserver: observer(
    'cephOsdsProxy.length',
    function osdsNumberObserver() {
      this.set(
        'allFieldsValues.meta.osdsNumber',
        this.get('cephOsdsProxy.length') || 1
      );
    }
  ),

  /**
   * Resets field if form visibility changes (clears validation errors)
   */
  isFormOpenedObserver: observer('isFormOpened', function isFormOpenedObserver() {
    if (this.get('isFormOpened')) {
      this.resetFormValues();
      this.set('lumaPrefixVisible', false);
    }
  }),

  selectedStorageTypeObserver: observer(
    'selectedStorageType',
    function selectedStorageTypeObserver() {
      this.resetFormValues();
      this._toggleLumaPrefix(false, false);
    }
  ),

  importedStorageDisabler: observer(
    'storageProvidesSupport',
    'storageSupportsImport',
    function importedStorageDisabler() {
      const {
        storageProvidesSupport,
        storageSupportsImport,
      } = this.getProperties('storageProvidesSupport', 'storageSupportsImport');

      this.enableImportedStorageField(storageSupportsImport, 'generic');
      this.enableImportedStorageField(
        !storageProvidesSupport && storageSupportsImport,
        'generic_editor',
        storageSupportsImport ?
        (storageProvidesSupport ? 'hasSupport' : 'enabled') : 'disabled'
      );
      if (!storageSupportsImport) {
        this.set('allFieldsValues.generic.importedStorage', false);
      }
      if (storageProvidesSupport) {
        const defaultImportedStorageEditValue =
          this.get('storage.importedStorage') || false;
        this.set(
          'allFieldsValues.generic_editor.importedStorage',
          defaultImportedStorageEditValue
        );
      }
    }
  ),

  modeObserver: observer('mode', function modeObserver() {
    this._fillInForm();
    this.setProperties({
      areQosParamsValid: true,
      editedQosParams: undefined,
    });
    this.fetchCephOsds();
  }),

  init() {
    this._super(...arguments);

    const {
      storage,
      storageTypes,
      selectedStorageType,
    } = this.getProperties(
      'storage',
      'storageTypes',
      'selectedStorageType',
    );

    const genericFields = GENERIC_FIELDS.map(field => EmberObject.create(field));
    genericFields.forEach(field => {
      field.set('name', 'generic.' + field.get('name'));
      field.set('originPrefix', 'generic');
    });
    const lumaFields = LUMA_FIELDS.map(field => EmberObject.create(field));
    lumaFields.forEach(field => {
      field.set('name', 'luma.' + field.get('name'));
      field.set('originPrefix', 'luma');
    });
    this.setProperties({
      genericFields,
      lumaFields,
    });
    storageTypes.forEach(type =>
      type.fields = type.fields.map(field =>
        EmberObject.create(field))
    );
    storageTypes.forEach(type =>
      type.fields.forEach(field => {
        field.set('name', type.id + '.' + field.get('name'));
        field.set('originPrefix', type.id);
      })
    );

    this._addFieldsLabels();
    this._generateStaticFields();
    this._generateEditorFields();
    if (storage) {
      this._fillInForm();
    } else if (selectedStorageType) {
      this.selectedStorageTypeObserver();
    }
    this.fetchCephOsds();
    this.osdsNumberObserver();
    this.importedStorageDisabler();
    this.get('cephOsdsProxy')
      .then(() => safeExec(this, () => {
        this.introduceCephOsds();
        // Select default (first) storage type if it is still empty
        if (!this.get('selectedStorageType')) {
          this.set(
            'selectedStorageType',
            this.get('visibleStorageTypes.firstObject')
          );
        }
      }));
  },

  fetchCephOsds() {
    const {
      mode,
      cephManager,
      element,
    } = this.getProperties('mode', 'cephManager', 'element');
    if (mode === 'show') {
      this.set('showLoadingSpinner', false);
    } else {
      if (
        mode === 'create' ||
        (mode === 'edit' && this.get('storage.type') === 'localceph')
      ) {
        const osdProxy = PromiseArray.create({
          promise: cephManager.suppressNotDeployed(cephManager.getOsds(), []),
        });
        if (!element) {
          this.set('cephOsdsProxy', osdProxy);
        } else {
          this.set('showLoadingSpinner', true);
          osdProxy
            .finally(() =>
              safeExec(this, () => this.setProperties({
                cephOsdsProxy: osdProxy,
                showLoadingSpinner: false,
              }))
            );
        }
      }
    }
  },

  /**
   * Puts information about osds into form fields (sets default values for
   * some fields).
   * @returns {undefined}
   */
  introduceCephOsds() {
    const {
      cephOsdsProxy,
      allFields,
      allFieldsValues,
    } = this.getProperties('cephOsdsProxy', 'allFields', 'allFieldsValues');
    const osdsNumber = get(cephOsdsProxy, 'length') || 1;
    const defaultPoolSize = osdsNumber > 1 ? 2 : 1;

    const copiesNumberField = allFields.findBy('name', 'localceph.copiesNumber');
    set(copiesNumberField, 'defaultValue', defaultPoolSize);
    set(allFieldsValues, 'localceph.copiesNumber', defaultPoolSize);
  },

  /**
   * @override
   */
  resetFormValues() {
    this._super(...arguments);
    this.set(
      'allFieldsValues.generic.storagePathType',
      storagePathTypeDefaults[this.get('selectedStorageType.id')]
    );
    this.resetQosFormState();
  },

  /**
   * @returns {undefined}
   */
  resetQosFormState() {
    this.setProperties({
      areQosParamsValid: true,
      editedQosParams: undefined,
    });
  },

  /**
   * Sets fields labels and tips translations
   * @returns {undefined}
   */
  _addFieldsLabels() {
    const {
      storageTypes,
      genericFields,
      lumaFields,
    } = this.getProperties('storageTypes', 'genericFields', 'lumaFields');
    storageTypes.forEach(({ id: typeId, fields }) => {
      fields.forEach(field =>
        this._addFieldLabelTranslation(typeId, field)
      );
    });
    genericFields.forEach(field =>
      this._addFieldLabelTranslation('generic', field)
    );
    lumaFields.forEach(field =>
      this._addFieldLabelTranslation('luma', field)
    );
  },

  /**
   * Sets field label and tip translations
   * @param {string} typeId storage type
   * @param {FieldType} field
   * @returns {undefined}
   */
  _addFieldLabelTranslation(typeId, field) {
    if (!field.label) {
      field.set('label', this.t(
        `${typeId}.${this.cutOffPrefix(field.name)}.name`
      ));
    }
    if (field.tip === true) {
      field.set('tip', this.t(
        `${typeId}.${this.cutOffPrefix(field.name)}.tip`
      ));
    }
  },

  /**
   * Creates static fields
   * @returns {undefined}
   */
  _generateStaticFields() {
    const createFields = this.get('createFields');

    const staticFields = createFields.map(f => EmberObject.create(f));
    staticFields.forEach(field => {
      field.setProperties({
        type: 'static',
        name: this._addToFieldPrefix(field, '_static'),
      });
    });

    this.set('staticFields', staticFields);
  },

  /**
   * Creates editor fields
   * @returns {undefined}
   */
  _generateEditorFields() {
    const {
      createFields,
      staticFields,
    } = this.getProperties('createFields', 'staticFields');

    this.set('editorFields', createFields.map((createField, index) => {
      let field = EmberObject.create(
        createField.get('notEditable') ? staticFields[index] : createField
      );
      field.set('name', this._addToFieldPrefix(field, '_editor'));
      return field;
    }));
  },

  /**
   * Sets form default values to values gathered from storage
   * @returns {undefined}
   */
  _fillInForm() {
    const {
      storageTypes,
      storage,
      allFieldsValues,
      allFields,
    } = this.getProperties(
      'storageTypes',
      'storage',
      'allFieldsValues',
      'allFields'
    );

    this.prepareFields();
    this.resetQosFormState();

    const storageType = storageTypes.findBy('id', get(storage, 'type'));
    this.send('storageTypeChanged', storageType);

    this._toggleLumaPrefix(!!storage['lumaEnabled'], false);

    ['generic', 'luma', get(storageType, 'id')].forEach(prefix => {
      _.keys(allFieldsValues[prefix]).forEach(fieldName => {
        const editorFieldName = prefix + '_editor.' + fieldName;
        const editorField = allFields.findBy('name', editorFieldName);
        const fieldOptions = get(editorField, 'options');
        let staticValue = storage[fieldName];
        if (fieldOptions) {
          const option = fieldOptions.findBy('value', staticValue);
          if (option) {
            staticValue = get(option, 'label');
          }
        }
        allFieldsValues.set(prefix + '_static.' + fieldName, staticValue);
        allFieldsValues.set(editorFieldName, storage[fieldName]);
      });
    });
    allFieldsValues.set('type_static.type', get(storageType, 'name'));
  },

  /**
   * Adds suffix to the field prefix so it changes from
   * prefix.fieldName to prefixsuffix.fieldName.
   * @param {FieldType} field 
   * @param {string} suffix
   * @returns {string} new field name
   */
  _addToFieldPrefix(field, suffix) {
    return field.get('originPrefix') + suffix + '.' +
      this.cutOffPrefix(field.get('name'));
  },

  /**
   * Shows/hides luma fields
   * @param {boolean} isVisible 
   * @param {boolean} animate 
   */
  _toggleLumaPrefix(isVisible, animate = true) {
    const {
      allFields,
      inEditionMode,
      lumaPrefixVisibleTimeoutId,
    } = this.getProperties(
      'allFields',
      'inEditionMode',
      'lumaPrefixVisibleTimeoutId'
    );

    const lumaFields = allFields
      .filter(f => f.get('name').startsWith('luma.') ||
        f.get('name').startsWith('luma_editor.'));

    clearTimeout(lumaPrefixVisibleTimeoutId);
    if (animate) {
      if (isVisible) {
        lumaFields.forEach(field =>
          set(field, 'cssClass', 'transparent animated fast fadeIn')
        );
        this.set('lumaPrefixVisible', true);
      } else {
        this.set('lumaPrefixVisibleTimeoutId', setTimeout(() => {
          run(() => safeExec(this, 'set', 'lumaPrefixVisible', false));
        }, VISIBILITY_ANIMATION_TIME));
        lumaFields.forEach(field =>
          set(field, 'cssClass', 'transparent animated fast fadeOut')
        );
      }
    } else {
      lumaFields.forEach(field => set(field, 'cssClass', ''));
      this.set('lumaPrefixVisible', isVisible);
    }
    // load default values for luma fields in "create" mode
    if (isVisible && !inEditionMode) {
      this.resetFormValues(['luma']);
    }
  },

  /**
   * @param {boolean} enable 
   * @param {String} prefix 
   * @param {String} [tipName]
   */
  enableImportedStorageField(enable, prefix, tipName = undefined) {
    const importedStorageField =
      this.getField(`${prefix}.importedStorage`);
    if (!tipName) {
      tipName = enable ? 'enabled' : 'disabled';
    }
    setProperties(importedStorageField, {
      disabled: !enable,
      tip: this.t(
        `generic.importedStorage.tip.${tipName}`
      ),
    });
  },

  actions: {
    storageTypeChanged(type) {
      this.set('selectedStorageType', type);
    },

    inputChanged(fieldName, value) {
      this.changeFormValue(fieldName, value);
      if (fieldName === 'generic.lumaEnabled' ||
        fieldName === 'generic_editor.lumaEnabled') {
        this._toggleLumaPrefix(value);
      }
    },

    toggleChanged({ newValue, context }) {
      let fieldName = context.get('fieldName');
      invoke(this, 'inputChanged', fieldName, newValue);
    },

    focusOut(field) {
      const {
        inEditionMode,
        lumaEnabledByEdition,
      } = this.getProperties('inEditionMode', 'lumaEnabledByEdition');
      const formValue = this.get('formValues.' + get(field, 'name'));

      const isLumaEditorField =
        _.startsWith(get(field, 'name'), 'luma_editor.') && lumaEnabledByEdition;

      // do not allow validation for not modified fields in edition mode
      if (
        !inEditionMode ||
        ((formValue !== undefined && formValue !== null) || isLumaEditorField)
      ) {
        set(field, 'changed', true);
        this.recalculateErrors();
      }
    },

    showModifyModal() {
      this.set('modifyModalVisible', true);
      return resolve();
    },

    qosParamsChanged({ isValid, qosParams }) {
      this.setProperties({
        areQosParamsValid: isValid,
        editedQosParams: qosParams,
      });
    },

    submit() {
      let {
        formValues,
        currentFields,
        selectedStorageType,
        inEditionMode,
        storage,
        editedQosParams,
      } = this.getProperties(
        'formValues',
        'currentFields',
        'selectedStorageType',
        'inEditionMode',
        'storage',
        'editedQosParams'
      );

      this.set('isSavingStorage', true);

      let formData = {};

      currentFields.forEach(({ name }) => {
        let prefixlessName = this.cutOffPrefix(name);
        formData[prefixlessName] = formValues.get(name);
      });
      formData = stripObject(formData, [undefined, null]);
      if (editedQosParams) {
        set(formData, 'qosParameters', editedQosParams);
      }
      if (!inEditionMode) {
        formData = stripObject(formData, ['']);
      } else {
        _.keys(formData).forEach(key => {
          // change cleared fields to null
          if (formData[key] === '') {
            formData[key] = null;
          }
          // remove not modified data
          let storageValue = storage[key] === undefined || storage[key] === '' ?
            null : storage[key];
          if ((storageValue === null && formData[key] === null) ||
            (JSON.stringify(storageValue) === JSON.stringify(formData[key]) &&
              storageValue !== null && formData[key] !== null)) {
            delete formData[key];
          }
        });
      }
      formData.type = selectedStorageType.id;

      return this.get('submit')(formData)
        .finally(() => safeExec(this, () => this.setProperties({
          modifyModalVisible: false,
          isSavingStorage: false,
        })));
    },
  },
});
