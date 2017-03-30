import Ember from 'ember';
import { invokeAction } from 'ember-invoke-action';

const { Component } = Ember;


/**
 * Creates toggle-like checkbox based one the one-toggle-checkbox component.
 *
 * @module components/one-way-toggle.js
 * @author Michał Borzęcki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */
export default Component.extend({
  classNames: ['one-way-toggle'],

  /**
   * Pass click handling to underlying one-way-checkbox
   */
  click() {
    this.$('input').click();
  },

  didInsertElement() {
    this._super(...arguments);

    // Fix for Firefox to handle toggle change by 
    // label-click and keyboard change on active input
    this.$('input').change((event) => {
      let originalTarget = event.originalEvent.explicitOriginalTarget;
      // originalTarget == undefined in Chrome, nodeType == 3 is text node (label)
      if (originalTarget && 
        (originalTarget.tagName === "INPUT" || originalTarget.nodeType === 3)) {
        this.click();
      }
    });
  },

  actions: {
    updateHandler(value) {
      invokeAction(this, 'update', value, this);
    }
  }
});
