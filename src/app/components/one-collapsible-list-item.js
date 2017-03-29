import Ember from 'ember';
import { invokeAction } from 'ember-invoke-action';

/**
 * Item class of the collapsible list. For example of use case see 
 * components/one-collapsible-list.js.
 * 
 * If isCollapsible == false then item cannot be toggled.
 *
 * @module components/one-collapsible-list-item.js
 * @author Michał Borzęcki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */
export default Ember.Component.extend({
  tagName: 'li',
  classNames: ['one-collapsible-list-item'],
  classNameBindings: ['isActive:active'],
  isCollapsible: true,
  isActive: false,
  accordionMode: false,
  activeElementId: '',

  activeElementIdObserver: Ember.observer('activeElementId', 'accordionMode', function () {
    if (this.get('accordionMode')) {
      this.set('isActive', this.get('activeElementId') === this.get('elementId'));
    }
  }),

  actions: {
    toggle() {
      if (!this.get('isCollapsible')) {
        return;
      }
      if (this.get('accordionMode')) {
        invokeAction(this, 'toggle', this.get('elementId'));
      } else {
        this.toggleProperty('isActive');
      }
    }
  }
});
