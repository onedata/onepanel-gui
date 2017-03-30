import Ember from 'ember';
import { invokeAction } from 'ember-invoke-action';
const { computed } = Ember;

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
  accordionMode: false,
  activeElementId: '',

  isActive: computed('activeElementId', 'accordionMode', function () {
    let {
      activeElementId, elementId
    } = this.getProperties([
      'activeElementId', 'elementId'
    ]);
    if (this.get('accordionMode')) {
      return activeElementId === elementId;
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
