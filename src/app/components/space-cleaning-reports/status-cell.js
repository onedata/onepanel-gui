/**
 * A table cell used to display report status using oneicon.
 *
 * @module components/space-cleaning-reports/status-cell
 * @author Michal Borzecki
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

import { get, computed } from '@ember/object';
import { inject as service } from '@ember/service';

export default Component.extend({
  classNames: ['status-cell'],

  i18n: service(),

  /**
   * Record.
   * To inject.
   * @type {Onepanel.SpaceAutoCleaningReport}
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
   * Icon name.
   * @type {computed.string}
   */
  _iconName: computed(
    'record.status',
    function () {
      let status = this.get('record.status');
      
      switch (status) {
        case 'active':
          return 'update';
        case 'completed':
          return 'checkbox-filled';
        case 'failed':
          return 'checkbox-filled-x';
        case 'cancelling':
        case 'cancelled':
          return 'cancelled';
      }
    }
  ),

  /**
   * Tooltip content for status.
   * @type {Ember.ComputedProperty<string>}
   */
  _tip: computed(
    'record.status',
    function () {
      let {
        i18n,
        record,
      } = this.getProperties('i18n', 'record');
      const prefix = 'components.spaceCleaningReports.statusValues.';
      return i18n.t(prefix + get(record, 'status'));
    }
  ),
});
