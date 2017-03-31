import Ember from 'ember';

/**
 * Creates a table element which uses JQuery Basic Table to handle with small devices.
 *
 * @module components/basic-table.js
 * @author Michał Borzęcki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */
export default Ember.Component.extend({
  tagName: 'table',
  classNames: ['basic-table', 'no-resize'],

  didInsertElement() {
    this._super(...arguments);
    this.$().basictable({
      breakpoint: 1200
    });
  },

  willDestroyElement() {
    this._super(...arguments);
    this.$().basictable('destroy');
  }
});
