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

import stripObject from 'onepanel-gui/utils/strip-object';

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

const storageTypesFields = {
  ceph: CEPH_FIELDS,
  posix: POSIX_FIELDS,
  s3: S3_FIELDS,
  swift: SWIFT_FIELDS,
};

export default Ember.Component.extend({
  classNames: ['cluster-storage-add-form'],

  i18n: service(),

  genericFields: computed(() => GENERIC_FIELDS).readOnly(),
  storageTypes: computed(() => storageTypes).readOnly(),

  selectedStorageType: null,
  formValues: null,

  specificFields: computed('selectedStorageType.id', function () {
    return storageTypesFields[this.get('selectedStorageType.id')];
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

  allFields: computed('genericFields', 'currentFields', function () {
    let {
      genericFields,
      currentFields,
    } = this.getProperties('genericFields', 'currentFields');
    return [...genericFields, ...currentFields];
  }),

  init() {
    this._super(...arguments);
    if (this.get('selectedStorageType') == null) {
      this.set('selectedStorageType', this.get('storageTypes.firstObject'));
    }
    this.set('formValues', Ember.Object.create({}));
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
      // TODO: it probably modifies imported array... do this in some initializer
      field.placeholder = i18n.t(
        `components.clusterStorageAddForm.${typeId}.${field.name}`
      );
    }
  },

  resetFormValues() {
    let { allFields } = this.getProperties('allFields');
    let formValues = Ember.Object.create({});
    allFields.forEach(({ name, defaultValue }) => {
      formValues.set(name, defaultValue);
    });
    this.set('formValues', formValues);
  },

  /**
   * Is the field present in current form?
   * @param {string} fieldName 
   */
  isKnownField(fieldName) {
    let { allFields } = this.getProperties('allFields');
    return allFields.map(field => field.name).indexOf(fieldName) !== -1;
  },

  actions: {
    storageTypeChanged(type) {
      this.resetFormValues();
      this.set('selectedStorageType', type);
    },

    inputChanged(field, value) {
      let {
        formValues
      } = this.getProperties(
        'formValues'
      );

      if (this.isKnownField(field)) {
        formValues.set(field, value);
      } else {
        console.warn(
          'component:cluster-storage-add-form: attempt to change not known input type'
        );
      }
    },

    toggleChanged({ newValue, context }) {
      let fieldName = context.get('fieldName');
      invoke(this, 'inputChanged', fieldName, newValue);
    },

    submit() {
      let {
        formValues,
        allFields,
        selectedStorageType
      } = this.getProperties(
        'formValues',
        'allFields',
        'selectedStorageType'
      );

      let formData = {
        type: selectedStorageType.id
      };

      allFields.forEach(({ name }) => {
        formData[name] = formValues.get(name);
      });
      return invokeAction(this, 'submit', stripObject(formData, [undefined, null, '']));
    },
  }
});
