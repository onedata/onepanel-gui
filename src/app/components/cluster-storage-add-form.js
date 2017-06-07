/**
 * A form for adding new storage with all storage types available
 *
 * @module components/cluster-storage-add-form
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import { invoke, invokeAction } from 'ember-invoke-action';
import { buildValidations } from 'ember-cp-validations';
import _object from 'lodash/object';

import stripObject from 'onepanel-gui/utils/strip-object';
import OneForm from 'onepanel-gui/components/one-form';
import storageTypes from 'onepanel-gui/utils/cluster-storage/storage-types';
import GENERIC_FIELDS from 'onepanel-gui/utils/cluster-storage/generic-fields';
import createFieldValidator from 'onepanel-gui/utils/create-field-validator';

const {
  computed,
  observer,
  inject: {
    service
  }
} = Ember;

function createValidations(storageTypes, genericFields) {
  let validations = {};
  storageTypes.forEach(type => {
    type.fields.forEach(field => {
      let fieldName = 'allFieldsValues.' + type.id + '.' + field.name;
      validations[fieldName] = createFieldValidator(field);
    });
  });
  genericFields.forEach(field => {
    let fieldName = 'allFieldsValues.generic.' + field.name;
    validations[fieldName] = createFieldValidator(field);
  });
  return validations;
}

const Validations = buildValidations(createValidations(storageTypes, GENERIC_FIELDS));

export default OneForm.extend(Validations, {
  unknownFieldErrorMsg: 'component:cluster-storage-add-form: attempt to change not known input type',
  currentFieldsPrefix: computed('selectedStorageType.id', function () {
    return ['generic', this.get('selectedStorageType.id')];
  }),
  allFields: computed('storageTypes.@each.fields', 'genericFields', function () {
    let {
      storageTypes,
      genericFields
    } = this.getProperties('storageTypes', 'genericFields');
    return storageTypes
      .concat({ fields: genericFields })
      .map(type => type.fields)
      .reduce((a, b) => a.concat(b));
  }),

  classNames: ['cluster-storage-add-form'],

  i18n: service(),

  /**
   * If true, form is visible to user
   * @type {boolean}
   */
  isFormOpened: false,

  genericFields: null,
  storageTypes: computed(() =>
    storageTypes.map(type => _object.assign({}, type))).readOnly(),

  selectedStorageType: null,

  allFieldsValues: computed('genericFields', 'storageTypes', function () {
    let fields = Ember.Object.create({
      generic: Ember.Object.create({})
    });
    let {
      genericFields,
      storageTypes
    } = this.getProperties('genericFields', 'storageTypes');
    storageTypes.forEach(type => {
      fields.set(type.id, Ember.Object.create({}));
      type.fields.forEach(field => fields.set(field.get('name'), null));
    });
    genericFields.forEach(field =>
      fields.set(field.get('name'), null)
    );
    return fields;
  }),

  /**
   * Resets field if form visibility changes (clears validation errors)
   */
  isFormOpenedObserver: observer('isFormOpened', function () {
    if (this.get('isFormOpened')) {
      this.resetFormValues();
    }
  }),

  init() {
    this._super(...arguments);
    if (this.get('selectedStorageType') == null) {
      this.set('selectedStorageType',
        this.get('storageTypes.firstObject'));
    }
    this.set('genericFields', GENERIC_FIELDS.map(fields =>
      Ember.Object.create(fields))
    );
    this.get('genericFields').forEach(field =>
      field.set('name', 'generic.' + field.get('name'))
    );
    this.get('storageTypes').forEach(type =>
      type.fields = type.fields.map(field =>
        Ember.Object.create(field))
    );
    this.get('storageTypes').forEach(type =>
      type.fields.forEach(field => 
      field.set('name', type.id + '.' + field.get('name')))
    );

    this.prepareFields();
    this._addFieldsLabels();
  },

  // TODO move to some helper or something  
  _addFieldsLabels() {
    let i18n = this.get('i18n');
    let {
      storageTypes,
      genericFields,
    } = this.getProperties('storageTypes', 'genericFields');
    storageTypes.forEach(({ id: typeId, fields }) => {
      fields.forEach(field =>
        this._addFieldLabelTranslation(typeId, field, i18n)
      );
    });
    genericFields.forEach(field =>
      this._addFieldLabelTranslation('generic', field, i18n)
    );
  },

  _addFieldLabelTranslation(typeId, field, i18n) {
    if (!field.label) {
      field.set('label', i18n.t(
        `components.clusterStorageAddForm.${field.name}`
      ));
    }
  },

  actions: {
    storageTypeChanged(type) {
      this.set('selectedStorageType', type);
      this.resetFormValues();
    },

    inputChanged(fieldName, value) {
      this.changeFormValue(fieldName, value);
    },

    toggleChanged({ newValue, context }) {
      let fieldName = context.get('fieldName');
      invoke(this, 'inputChanged', fieldName, newValue);
    },

    focusOut(field) {
      field.set('changed', true);
      this.recalculateErrors();
    },

    submit() {
      let {
        formValues,
        currentFields,
        selectedStorageType
      } = this.getProperties(
        'formValues',
        'currentFields',
        'selectedStorageType'
      );

      let formData = {
        type: selectedStorageType.id
      };

      currentFields.forEach(({ name }) => {
        formData[this.cutOffPrefix(name)] = formValues.get(name);
      });
      return invokeAction(this, 'submit', 
        stripObject(formData, [undefined, null, '']));
    },
  }
});
