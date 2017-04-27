import Ember from 'ember';
import { invokeAction, invoke } from 'ember-invoke-action';

const { Component } = Ember;

/**
 * Creates toggle-like checkbox based one the one-toggle-checkbox component.
 *
 * @module components/one-way-toggle.js
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */
export default Component.extend({
  classNames: ['one-way-toggle'],
  classNameBindings: ['isReadOnly:disabled', 'isReadOnly::clickable'],
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
    this.$('input').change((event) => {
      let originalTarget = event.originalEvent.explicitOriginalTarget;
      // originalTarget == undefined in Chrome, nodeType == 3 is text node (label)
      if (originalTarget &&
        (originalTarget.tagName === "INPUT" || originalTarget.nodeType === 3)) {
        invoke(this, 'toggle');
      }
    });
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
