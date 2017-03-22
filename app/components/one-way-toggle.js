import Ember from 'ember';
import { invokeAction } from 'ember-invoke-action';
import OneWayCheckboxComponent from 'ember-one-way-controls';

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

  actions: {
    updateHandler(value) {
      invokeAction(this, 'update', value, this);
    }
  }
});
