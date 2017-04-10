/**
 * A form for adding new storage with all storage types available
 *
 * @module components/cluster-storage-add-form
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import { invoke, invokeAction } from 'ember-invoke-action';
import { validator, buildValidations } from 'ember-cp-validations';

import stripObject from 'onepanel-gui/utils/strip-object';
import OneForm from 'onepanel-gui/components/one-form';

import GENERIC_FIELDS from 'onepanel-gui/utils/cluster-storage/generic-fields';
import CEPH_FIELDS from 'onepanel-gui/utils/cluster-storage/ceph-fields';
import POSIX_FIELDS from 'onepanel-gui/utils/cluster-storage/posix-fields';
import S3_FIELDS from 'onepanel-gui/utils/cluster-storage/s3-fields';
import SWIFT_FIELDS from 'onepanel-gui/utils/cluster-storage/swift-fields';

const {
  computed,
  inject: {
    service
  }
} = Ember;

const storageTypes = [{
  id: 'ceph',
  name: 'Ceph',
  fields: CEPH_FIELDS
}, {
  id: 'posix',
  name: 'POSIX',
  fields: POSIX_FIELDS
}, {
  id: 's3',
  name: 'S3',
  fields: S3_FIELDS
}, {
  id: 'swift',
  name: 'Swift',
  fields: SWIFT_FIELDS
}];

function createValidations(storageTypes, genericFields) {
  let validations = {};
  storageTypes.forEach(type => {
    type.fields.concat(genericFields).forEach(field => {
      let fieldName = 'allFieldsValues.' + type.id + '.' + field.name;
      validations[fieldName] = [];
      if (!field.optional) {
        validations[fieldName].push(validator('presence', true));
      }
    });
  });
  return validations;
}

const Validations = buildValidations(createValidations(storageTypes, GENERIC_FIELDS));

export default OneForm.extend(Validations, {
  unknownFieldErrorMsg: 'component:cluster-storage-add-form: attempt to change not known input type',
  currentFieldsPrefix: computed.alias('selectedStorageType.id'),
  allFields: computed('storageTypes.@each.fields', 'genericFields', function() {
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

  genericFields: null,
  storageTypes: computed(() => storageTypes).readOnly(),

  selectedStorageType: null,

  specificFields: computed('selectedStorageType', function () {
    return this.get('storageTypes')
      .filter(type => type.id === this.get('selectedStorageType.id'))[0].fields;
  }),

  /**
   * @type {computed.FieldType}
   */
  currentFields: computed('genericFields.[]', 'specificFields.[]', function () {
    let {
      genericFields,
      specificFields,
    } = this.getProperties(
      'genericFields',
      'specificFields'
    );

    return genericFields.concat(specificFields);
  }),

  allFieldsValues: computed('genericFields', 'storageTypes', function () {
    let fields = Ember.Object.create({});
    let {
      genericFields,
      storageTypes
    } = this.getProperties('genericFields', 'storageTypes');
    storageTypes.forEach(type => {
      fields.set(type.id, Ember.Object.create({}));
      type.fields.concat(genericFields).forEach(field => {
        fields.set(type.id + "." + field.get('name'), null);
      });
    });
    return fields;
  }),

  init() {
    this._super(...arguments);
    if (this.get('selectedStorageType') == null) {
      this.set('selectedStorageType', this.get('storageTypes.firstObject'));
    }
    this.set('genericFields', GENERIC_FIELDS.map(fields => Ember.Object.create(fields)));
    this.get('storageTypes').forEach(type => type.fields = type.fields.map(field =>
      Ember.Object.create(field)));

    this.prepareFields();
    this._addFieldsPlaceholders();
  },

  // FIXME move to some helper or something  
  _addFieldsPlaceholders() {
    let i18n = this.get('i18n');
    let {
      storageTypes,
      genericFields,
    } = this.getProperties('storageTypes', 'genericFields');
    storageTypes.forEach(({ id: typeId, fields }) => {
      fields.forEach(field =>
        this._addFieldPlaceholderTranslation(typeId, field, i18n)
      );
    });
    genericFields.forEach(field =>
      this._addFieldPlaceholderTranslation('generic', field, i18n)
    );
  },

  _addFieldPlaceholderTranslation(typeId, field, i18n) {
    if (!field.placeholder) {
      field.set('placeholder', i18n.t(
        `components.clusterStorageAddForm.${typeId}.${field.name}`
      ));
    }
  },

  actions: {
    storageTypeChanged(type) {
      this.resetFormValues();
      this.set('selectedStorageType', type);
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
        formData[name] = formValues.get(name);
      });
      return invokeAction(this, 'submit', stripObject(formData, [undefined, null, '']));
    },
  }
});
