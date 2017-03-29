import Ember from 'ember';

/**
 * Item header class of the collapsible list. For example of use case see 
 * components/one-collapsible-list.js.
 * 
 * If toolbarWhenOpened == true then .btn-toolbar elements will be 
 * visible only if the list item is expanded.
 * isCollapsible == false hides the arrow icon on the right.
 *
 * @module components/one-collapsible-list-item-header.js
 * @author Michał Borzęcki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */
export default Ember.Component.extend({
  tagName: 'div',
  classNames: ['one-collapsible-list-item-header', 'row'],
  classNameBindings: ['isOpened:opened', 'isCollapsible:collapsible',
    'toolbarWhenOpened:toolbar-when-opened'
  ],

  didInsertElement() {
    this._super(...arguments);

    this.$(".btn-toolbar").click((event) => {
      event.preventDefault();
      event.stopPropagation();
    })
  }
});
