import Ember from 'ember';
import { invokeAction, invoke } from 'ember-invoke-action';

const {
  Component,
} = Ember;

/**
 * Creates a base for checkbox-like components using the one-way-checkbox component.
 * Allows to put checkbox deeper in DOM without worry about value change handling.
 *
 * @module components/one-checkbox-base.js
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */
export default Component.extend({
  classNames: ['one-checkbox-base'],
  classNameBindings: ['isReadOnly:disabled:clickable', 'checked'],
  attributeBindings: ['dataOption:data-option'],

  /**
   * Element ID for rendered invisible input element
   * @type {string}
   */
  inputId: null,

  /**
   * If true, toggle is in enabled state
   * @type {boolean}
   */
  checked: false,

  /**
   * If true, user couldn't change value of toggle
   * @type {boolean}
   */
  isReadOnly: false,

  /**
   * Optional - data-option attribute for rendered component
   * @type {string}
   */
  dataOption: null,

  didInsertElement() {
    this._super(...arguments);

    // Fix for Firefox to handle toggle change by 
    // label-click and keyboard change on active input
    this.$('input').click((event) => event.stopImmediatePropagation());
  },

  click() {
    invoke(this, 'toggle');
  },

  actions: {
    /**
     * Pass click handling to underlying one-way-checkbox
     */
    toggle() {
      if (!this.get('isReadOnly')) {
        this.$('input').click();
      }
    },
    updateHandler(value) {
      invokeAction(this, 'update', value, this);
    }
  }
});
