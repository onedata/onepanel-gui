import Ember from 'ember';
import { invokeAction } from 'ember-invoke-action';

const { Component } = Ember;

/**
 * Creates radio inputs group based one the one-toggle-radio component.
 *
 * @module components/one-way-radio-group
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */
export default Component.extend({
  classNames: ['one-way-radio-group'],
  classNameBindings: ['isReadOnly:disabled'],
  attributeBindings: ['dataOption:data-option'],

  /**
   * To inject.
   * Name of the field (used to generate class names for radio inputs)
   * @type {string}
   */
  fieldName: '',
  
  /**
   * Element ID for first rendered radio input
   * @type {string}
   */
  inputId: null,

  /**
   * If true, user couldn't change value
   * @type {boolean}
   */
  isReadOnly: false,

  /**
   * Optional - data-option attribute for rendered component
   * @type {string}
   */
  dataOption: null,

  /**
   * To inject.
   * A function called, when selected value changes
   * @type {Function}
   */
  update: null,

  actions: {
    updateHandler(value) {
      invokeAction(this, 'update', value, this);
    }
  }
});