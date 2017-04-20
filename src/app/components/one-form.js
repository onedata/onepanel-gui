/**
 * A base form component with dynamic field generation and validation.
 * 
 * Fields used in that component should be in format:
 * `{ name: 'someName', type: 'text', ...moreFieldOptions }`
 * and be a regular Ember object. See also FieldType type in 
 * components/one-form-fields.
 * 
 * Proper validations mixin should be included to handle validation.
 * Validations object should use fields defined in allFieldsValues, e.g.
 * 'allFieldsValues.somePrefix.someFieldValue': validators...
 * 
 * After all fields setup - usually at the end of init() - prepareFields() 
 * should be called.
 * 
 * The component uses prefixes (sth like namespaces) for grouping fields.
 * It can be used to handle multiple different scenarios of displaying form fields.
 * More inormation about prefixes in comments for commponent fields.
 *
 * @module components/one-form
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

const {
  computed,
  observer
} = Ember;

export default Ember.Component.extend({
  /**
   * Message used as a warning message after unknown field change.
   * @abstract
   * @type {string}
   */
  unknownFieldErrorMsg: 'component:form-component: attempt to change not known input type',

  /**
   * Array of all fields used in the form (both active and inactive)
   * @abstract
   * @type {Array.FieldType}
   */
  allFields: null,

  /**
   * Object with all fields values in the form (both active and inactive).
   * @abstract
   * @type {Ember.Object}
   * 
   * Uses prefixes to distinct different field groups. Almost one group 
   * (prefix) must be defined. Example with two prefixes - group1 and group2:
   * ```
   * {
   *   'group1.name': null,
   *   'group1.surname': null,
   *   'group2.name': null,
   *   'group2.city': null
   * }
   * ```
   * If there is only one prefix, it is recommended to name it `main`.
   */
  allFieldsValues: null,

  /**
   * Array of active (usually visible) form fields. All should
   * be used within the same prefix.
   * @abstract
   * @type {Array.Ember.Object}
   */
  currentFields: null,

  /**
   * Prefix for the active group of fields.
   * @abstract
   * @type {string}
   * 
   * While validation all values from that prefix are being checked
   * (even if corresponding fields are not in currentFields).
   */
  currentFieldsPrefix: '',

  /**
   * Values of fields in the current prefix. Used in html form.
   * @type {Object}
   */
  formValues: computed('allFieldsValues', 'currentFieldsPrefix', function () {
    return this.get('allFieldsValues.' + this.get('currentFieldsPrefix'));
  }),

  /**
   * Array of error objects from ember-cp-validations.
   * @type {Array[Object]}
   */
  errors: computed('currentFieldsPrefix', 'validations.errors.[]', function () {
    let {
      currentFieldsPrefix,
      validations
    } = this.getProperties('currentFieldsPrefix', 'validations');
    let attrPrefix = 'allFieldsValues.' + currentFieldsPrefix + '.';
    return validations.get('errors')
      .filter(error => error.get('attribute').startsWith(attrPrefix));
  }),

  /**
   * Validity status of values from the selected prefix.
   */
  isValid: computed.empty('errors'),

  currentFieldsPrefixObserver: observer('currentFieldsPrefix', function () {
    this.recalculateErrors();
  }),

  /**
   * Sets all fields to its initial state
   */
  prepareFields() {
    let {
      allFields
    } = this.getProperties('allFields');
    allFields.forEach(field => {
      this._resetField(field);
    });
  },

  /**
   * Is the field present in current form?
   * @param {string} fieldName 
   */
  isKnownField(fieldName) {
    return this.get('currentFields')
      .map(field => field.get('name')).indexOf(fieldName) !== -1;
  },

  /**
   * Changes value of specified field
   * @param {string} fieldName
   * @param {any} value
   */
  changeFormValue(fieldName, value) {
    let {
      formValues,
      unknownFieldErrorMsg
    } = this.getProperties(
      'formValues',
      'unknownFieldErrorMsg'
    );
    if (this.isKnownField(fieldName)) {
      formValues.set(fieldName, value);
      this.get('currentFields')
        .filter(f => f.get('name') === fieldName)
        .forEach(f => f.set('changed', true));
      this.recalculateErrors();
    } else {
      console.warn(unknownFieldErrorMsg);
    }
  },

  /**
   * Resets current fields to initial state
   */
  resetFormValues() {
    let {
      currentFields,
      formValues
    } = this.getProperties('currentFields', 'formValues');
    currentFields.forEach(field => {
      formValues.set(field.get('name'), field.get('defaultValue'));
      this._resetField(field);
    });
  },

  /**
   * Sets validation information for current fields
   */
  recalculateErrors() {
    let {
      currentFieldsPrefix,
      currentFields,
      errors
    } = this.getProperties('currentFieldsPrefix', 'currentFields', 'errors');

    let prefix = 'allFieldsValues.' + currentFieldsPrefix + '.';
    currentFields.forEach(field => {
      let error = errors
        .filter(error => error.get('attribute') === prefix + field.get('name'));
      error = error.length > 0 ? error[0] : null;
      if (field.get('changed')) {
        field.setProperties({
          isValid: !error,
          isInvalid: !!error,
          message: error ? error.get('message') : ''
        });
      } else {
        field.setProperties({
          isValid: false,
          isInvalid: false,
          message: ''
        });
      }
    });
  },

  /**
   * Resets field to the initial state (not changed, after no validation)
   * @param {string} field
   */
  _resetField(field) {
    field.setProperties({
      changed: false,
      isValid: false,
      isInvalid: false,
      message: '',
    });
  },
});
