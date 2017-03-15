import Ember from 'ember';

/**
 * @typedef {Object} FieldType
 * @property {string} name
 * @property {string} type
 * @property {boolean} [optional=undefined]
 * @property {*} [defaultValue=undefined]
 */

import GENERIC_FIELDS from 'onepanel-web-frontend/utils/cluster-storage/generic-fields';
import CEPH_FIELDS from 'onepanel-web-frontend/utils/cluster-storage/ceph-fields';
import POSIX_FIELDS from 'onepanel-web-frontend/utils/cluster-storage/posix-fields';
import S3_FIELDS from 'onepanel-web-frontend/utils/cluster-storage/s3-fields';
import SWIFT_FIELDS from 'onepanel-web-frontend/utils/cluster-storage/swift-fields';

const {
  computed
} = Ember;

export default Ember.Component.extend({
  genericFields: GENERIC_FIELDS,

  storageTypes: [{
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
  }],  
  
  selectedStorageType: null,
  formValues: null,

  /**
   * @type {computed.FieldType}
   */
  currentFields: computed('selectedStorageType', function() {
    let {
      genericFields,
      storageTypes,
      selectedStorageType
    } = this.getProperties(
      'genericFields',
      'storageTypes',
      'selectedStorageType'
    );

    return genericFields.concat(selectedStorageType.fields);
  }),

  init() {
    this._super(...arguments);
    this.set('selectedStorageType', this.get('storageTypes.firstObject'));
    this.set('formValues', Ember.Object.create({}));
  },

  resetFormValues() {
    let currentFields = this.get('currentFields');
    let formValues = Ember.Object.create({});
    currentFields.forEach(({ name, defaultValue }) => {
      formValues.set(name, defaultValue);
    });
    this.set('formValues', formValues);
  },

  /**
   * Is the field present in current form?
   * @param {string} fieldName 
   */
  isKnownField(fieldName) {
    return this.get('currentFields').map(cf => cf.name).indexOf(fieldName);
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
        console.warn('component:cluster-storage-add-form: attempt to change not known input type');
      }
    },
    
    submit() {
      let formValues = this.get('formValues');
      // FIXME debug
      console.debug('submit: ' + JSON.stringify(formValues));
      // this.sendAction('submit', formValues);
      return false;
    }
  }
});
