import Ember from 'ember';
import { invokeAction } from 'ember-invoke-action';

/**
 * Creates accordion-like list of elements. By default items can be expanded separately. 
 * If accordionMode = true then only one item can be expanded in the same time.
 * It is a contextual component - yields item component in hash. 
 * Lists can be nested.
 * 
 * Example:
 * ```
 * {{#one-collapsible-list as |list|}}
 *   {{#list.item as |listItem|}}
 *     {{#listItem.header}}
 *       Header (will toggle visibility of content on click).
 *     {{/listItem.header}}
 *     {{#listItem.content}}
 *       Hiddent content.
 *     {{/listItem.content}}
 *   {{/listItem}}
 *   {{!-- other items... --}}
 * {{/one-collapsible-list}}
 * ```
 *
 * @module components/one-collapsible-list.js
 * @author Michał Borzęcki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */
export default Ember.Component.extend({
  tagName: 'ul',
  classNames: ['one-collapsible-list'],
  accordionMode: false,
  activeElementId: '',

  /**
   * If true, each item can be selected through checkbox
   * @type {boolean}
   */
  hasCheckboxes: false,

  /**
   * Selected items change handler
   * @type {Function}
   */
  selectionChanged: null,

  /**
   * List of selected item values
   * @type {Array.*}
   */
  _selectedItemValues: [],

  actions: {
    toggle(elementId) {
      if (this.get('accordionMode')) {
        if (this.get('activeElementId') === elementId) {
          this.set('activeElementId', '');
        } else {
          this.set('activeElementId', elementId);
        }
      }
    },
    toggleItemSelection(itemValue, selectionState) {
      let _selectedItemValues = this.get('_selectedItemValues');
      if (selectionState === undefined) {
        if (_selectedItemValues.indexOf(itemValue) > -1) {
          _selectedItemValues = _selectedItemValues
            .filter(value => value !== itemValue);
        } else {
          _selectedItemValues = _selectedItemValues.concat([itemValue]);
        }
      }
      else {
        _selectedItemValues = _selectedItemValues
          .filter(value => value !== itemValue)
          .concat(selectionState ? [itemValue] : []);
      }

      this.set('_selectedItemValues', _selectedItemValues);
      invokeAction(this, 'selectionChanged', _selectedItemValues.slice(0));
    }
  }
});
