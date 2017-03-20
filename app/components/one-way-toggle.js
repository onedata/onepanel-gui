import Ember from 'ember';
import { invokeAction } from 'ember-invoke-action';
import OneWayCheckboxComponent from 'ember-one-way-controls';

const { Component } = Ember;

const OneWayCheckboxCustomComponent = Component.extend(OneWayCheckboxComponent, {
  // Pass click handling to underlying one-way-checkbox
  click() {
    this.$('input').click();
  },

  actions: {
    updateHandler(value) {
      invokeAction(this, 'update', value, this);
    }
  }
});

export default OneWayCheckboxCustomComponent;
