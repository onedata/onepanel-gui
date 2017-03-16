import Ember from 'ember';
import { invoke, invokeAction } from 'ember-invoke-action';

/**
 * @typedef {Object} FieldType
 * @property {string} name
 * @property {string} type
 * @property {boolean} [optional=undefined]
 * @property {*} [defaultValue=undefined]
 * @property {string} [placeholder=undefined]
 */

import GENERIC_FIELDS from 'onepanel-web-frontend/utils/cluster-storage/generic-fields';
import CEPH_FIELDS from 'onepanel-web-frontend/utils/cluster-storage/ceph-fields';
import POSIX_FIELDS from 'onepanel-web-frontend/utils/cluster-storage/posix-fields';
import S3_FIELDS from 'onepanel-web-frontend/utils/cluster-storage/s3-fields';
import SWIFT_FIELDS from 'onepanel-web-frontend/utils/cluster-storage/swift-fields';

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

export default Ember.Component.extend({
  i18n: service(),

  genericFields: computed(() => GENERIC_FIELDS).readOnly(),
  storageTypes: computed(() => storageTypes).readOnly(),

  selectedStorageType: null,
  formValues: null,

  /**
   * @type {computed.FieldType}
   */
  currentFields: computed('selectedStorageType', function () {
    let {
      genericFields,
      selectedStorageType
    } = this.getProperties(
      'genericFields',
      'selectedStorageType'
    );

    return genericFields.concat(selectedStorageType.fields);
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
    this.set('selectedStorageType', this.get('storageTypes.firstObject'));
    this.set('formValues', Ember.Object.create({}));
    this._addFieldsPlaceholders();
  },

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
      if (field.optional) {
        field.placeholder += (
          ' (' +
          i18n.t(`components.clusterStorageAddForm.generic.optional`) +
          ')'
        );
      }
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

      // FIXME debug
      // TODO make regular object
      return invokeAction(this, 'submit', formData);
    },
  }
});
