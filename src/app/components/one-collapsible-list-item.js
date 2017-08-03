import Ember from 'ember';
import { invokeAction } from 'ember-invoke-action';
const {
  computed,
  computed: {
    notEmpty
  },
  inject: {
    service,
  },
} = Ember;

/**
 * Item class of the collapsible list. For example of use case see 
 * components/one-collapsible-list.js.
 * 
 * If isCollapsible == false then item cannot be toggled.
 * Item closes its content if eventsBus triggers closeEventName event
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

  eventsBus: service(),

  isCollapsible: true,
  accordionMode: false,
  activeElementId: '',
  closeEventName: null,

  /**
   * Value, that will be returned by one-collapsible-list on this item select
   * @type {*}
   */
  selectionValue: null,

  /**
   * Item selection change handler. Injected by one-collapsible-list.
   * @type {Function}
   */
  toggleItemSelection: null,

  /**
   * List of selected list items
   * @type {Array.*}
   */
  _selectedItemValues: [],

  /**
   * If true, item has a checkbox
   */
  _hasCheckbox: false,

  isActive: computed('activeElementId', 'accordionMode', function () {
    let {
      activeElementId,
      elementId
    } = this.getProperties([
      'activeElementId', 'elementId'
    ]);
    if (this.get('accordionMode')) {
      return activeElementId === elementId;
    }
  }),

  _isSelected: computed('_selectedItemValues.[]', 'selectionValue', function () {
    let {
      _selectedItemValues,
      selectionValue
    } = this.getProperties('_selectedItemValues', 'selectionValue');
    return _selectedItemValues.indexOf(selectionValue) > -1;
  }),

  _isCheckboxActive: notEmpty('selectionValue'),

  init() {
    this._super();
    let {
      closeEventName,
      eventsBus
    } = this.getProperties('closeEventName', 'eventsBus');
    if (closeEventName) {
      eventsBus.on(closeEventName, () => this.set('isActive', false));
    }
  },

  actions: {
    toggle(opened) {
      if (!this.get('isCollapsible')) {
        return;
      }
      if (this.get('accordionMode')) {
        invokeAction(this, 'toggle', this.get('elementId'), opened);
      } else {
        if (opened !== undefined) {
          this.set('isActive', !!opened);
        } else {
          this.toggleProperty('isActive');
        }
      }
    },
    toggleSelection() {
      invokeAction(this, 'toggleItemSelection', this.get('selectionValue'));
    }
  }
});
