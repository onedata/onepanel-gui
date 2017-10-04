/**
 * A table cell used to display report status using oneicon.
 *
 * @module components/space-cleaning-reports/status-cell
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

const {
  observer,
  computed,
  computed: {
    oneWay,
  },
  on,
} = Ember;

export default Ember.Component.extend({
  classNames: ['status-cell'],
  classNameBindings: ['_status'],

  /**
   * Record.
   * To inject.
   * @type {Object}
   */
  record: null,

  /**
   * Column (object needs to have the same structure as the one used by 
   * ember-models-table).
   * To inject.
   * @type {Object}
   */
  column: null,

  /**
   * Status value.
   * Will be initialized by bindStatusProperty.
   * @type {computed.string}
   */
  _status: null,

  /**
   * Icon name.
   * @type {computed.string}
   */
  _iconName: computed('_status', function () {
    switch (this.get('_status')) {
      case 'success':
        return 'checkbox-filled';
      case 'failure':
        return 'checkbox-filled-x';
      default:
        return '';
    }
  }),

  bindStatusProperty: on('init', observer('column.propertyName', function () {
    let propertyName = this.get('column.propertyName');
    this.set('_status', oneWay(`record.${propertyName}`));
  })),
});
