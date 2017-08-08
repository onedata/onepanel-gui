/**
 * Creates accordion-like list of elements. By default items can be expanded separately. 
 * If accordionMode = true then only one item can be expanded in the same time.
 * It is a contextual component - yields header and item component in hash. 
 * 
 * List items can be selected using checkbox. To enable this functionality,
 * property hasCheckboxes must be set to true for list, and each item, that can be
 * selected must have property selectionValue defined. After each selection change
 * selectionChanged action is invoked with an array of selectionValue item properties.
 * 
 * Example:
 * ```
 * {{#one-collapsible-list as |list|}}
 *   {{#list.header title="List title"}}
 *     {{#bs-button class="btn-sm" type="info"}}some button{{/bs-button}}
 *   {{/list.header}}
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

import Ember from 'ember';
import { invoke, invokeAction } from 'ember-invoke-action';

const {
  computed,
  run: {
    next,
  },
} = Ember;

export default Ember.Component.extend({
  tagName: 'ul',
  classNames: ['one-collapsible-list'],
  classNameBindings: ['_searchQuery:filtered-list'],
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

  /**
   * Selection values for all list items (used to "select all" action)
   * @type {Array.*}
   */
  _availableItemValues: [],

  /**
   * If true, list is collapsed
   * @type {boolean}
   */
  _isListCollapsed: false,

  /**
   * String, that is used for list items filtering
   * @type {string}
   */
  _searchQuery: '',

  /**
   * If true, all items are selected
   * @type {computed.boolean}
   */
  _areAllItemsSelected: computed('_selectedItemValues.[]', 
    '_availableItemValues.[]', function () {
      let {
        _selectedItemValues,
        _availableItemValues,
      } = this.getProperties('_selectedItemValues', '_availableItemValues');
      return _selectedItemValues.length === _availableItemValues.length && 
        _availableItemValues.length !== 0;
    }
  ),

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
      let isOnList = _selectedItemValues.indexOf(itemValue) > -1;
      if (selectionState === undefined) {
        if ((selectionState === undefined || selectionState === false) && 
          isOnList) {
          _selectedItemValues = _selectedItemValues
            .filter(value => value !== itemValue);
        } else if ((selectionState === undefined || selectionState === true) && 
          !isOnList) {
          _selectedItemValues = _selectedItemValues.concat([itemValue]);
        }
      }
      this.set('_selectedItemValues', _selectedItemValues);
      invokeAction(this, 'selectionChanged', _selectedItemValues.slice(0));
    },
    notifyValue(itemValue, exists) {
      // next() to avoid multiple modification in a single render,
      // because all list items will probably notify its values in the same time
      next(() => {
        if (!this.isDestroying && !this.isDestroyed) {
          let _availableItemValues = this.get('_availableItemValues');
          let isOnList = _availableItemValues.indexOf(itemValue) > -1;
          if (exists && !isOnList) {
            this.set('_availableItemValues', 
              _availableItemValues.concat([itemValue]));
          } else if (!exists && isOnList) {
            this.set('_availableItemValues', 
              _availableItemValues.filter(v => v !== itemValue));
            invoke(this, 'toggleItemSelection', itemValue, false);
          }
        } 
      });
    },
    toggleAllItemsSelection() {
      let {
        _areAllItemsSelected,
        _availableItemValues,
      } = this.getProperties('_areAllItemsSelected', '_availableItemValues');
      this.set('_selectedItemValues', 
        _areAllItemsSelected ? [] : _availableItemValues.slice(0));
      invokeAction(this, 'selectionChanged', this.get('_selectedItemValues').slice(0));
    },
    collapseList(visibility) {
      if (visibility === undefined) {
        this.toggleProperty('_isListCollapsed');
      } else {
        this.set('_isListCollapsed', visibility);
      }
    },
    search(query) {
      this.set('_searchQuery', query);
    }
  }
});
