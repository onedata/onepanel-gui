/**
 * A base to create form with one set of fields with optional validation and submit button.
 *
 * It bases on ``one-form``, but got its template that generates simple form.
 *
 * Usage:
 * - create a new component that extends ``one-form-simple`` and uses its layout
 * - set``fields`` property, that is an array of FieldType (it will be copied)
 * - add ``Validations`` mixin to enable validations
 * - set ``submitButton`` to true/false and ``submitText`` to configure submit button
 *   (by default the button is present)
 * - inject ``submit`` action to handle submit action that sends an object with
 *   field values
 * - inject ``allValidChanged`` action handle validation state changes (whole form
 *   validation)
 *
 * @module components/one-form-simple
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import OneForm from 'onepanel-gui/components/one-form';
import { invoke, invokeAction } from 'ember-invoke-action';

const {
  assert,
  computed: { readOnly },
  observer,
  on,
} = Ember;

export default OneForm.extend({
  /**component
   * To inject.
   * @abstract
   * @type {Array.FieldType}
   */
  fields: null,

  currentFieldsPrefix: 'main',

  /**
   * Will be initialized from injected ``fields``
   * @type {Array.EmberObject}
   */
  allFields: null,
  currentFields: readOnly('allFields'),

  allFieldsValues: Ember.Object.create({
    main: Ember.Object.create({
      name: '',
    }),
  }),

  /**
   * Set to true, to render submit button
   * @type {boolean}
   */
  submitButton: true,

  /**
   * Text rendered in submit button
   * @type {string}
   */
  submitText: 'Submit',

  /**
   * If true, the submit button will be enabled
   * @type {computed.boolean}
   */
  _submitEnabled: readOnly('validations.isValid'),

  init() {
    this._super(...arguments);
    this._validateAttributes();
    this.set('allFields', this.get('fields').map(f => Ember.Object.create(f)));
    this.isValidChanged();
    this.prepareFields();
  },

  _validateAttributes() {
    let {
      submitButton,
      fields,
      submit,
    } = this.getProperties('submitButton', 'fields', 'submit');

    assert('fields property should be defined', fields != null);
    assert(
      'submit action should be passed if submit button is enabled', !submitButton ||
      submitButton && submit != null
    );
  },

  isValidChanged: on('init', observer('isValid', function () {
    invoke(this, 'allValidChanged', this.get('isValid'));
  })),

  actions: {
    /**
     * Invokes injected ``submit`` action with Ember Object containing
     * values of form. The receiver should know what field to get from it.
     */
    submit() {
      if (this.get('_submitEnabled')) {
        invokeAction(this, 'submit', this.get('allFieldsValues.main'));
      }
    },

    inputChanged(fieldName, value) {
      this.changeFormValue(fieldName, value);
    },

    focusOut(field) {
      field.set('changed', true);
      this.recalculateErrors();
    },

    allValidChanged(isValid) {
      invokeAction(this, 'allValidChanged', isValid);
    },
  }
});
