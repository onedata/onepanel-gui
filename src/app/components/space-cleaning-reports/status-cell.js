/**
 * A table cell used to display report status using oneicon.
 *
 * @module components/space-cleaning-reports/status-cell
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

import { computed } from '@ember/object';
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
    'record.{stoppedAt,releasedBytes,bytesToRelease}',
    function () {
      let {
        stoppedAt,
        releasedBytes,
        bytesToRelease,
      } = this.get('record').getProperties(
        'stoppedAt',
        'releasedBytes',
        'bytesToRelease'
      );
      if (!stoppedAt) {
        return 'update';
      } else if (releasedBytes >= bytesToRelease) {
        return 'checkbox-filled';
      } else {
        return 'checkbox-filled-x';
      }
    }
  ),

  /**
   * Tooltip content for status.
   * @type {Ember.ComputedProperty<string>}
   */
  _tip: computed(
    'record.{stoppedAt,releasedBytes,bytesToRelease}',
    function () {
      let {
        i18n,
        record,
      } = this.getProperties('i18n', 'record');
      let {
        stoppedAt,
        releasedBytes,
        bytesToRelease,
      } = record.getProperties(
        'stoppedAt',
        'releasedBytes',
        'bytesToRelease'
      );
      const prefix = 'components.spaceCleaningReports.statusValues.';
      if (!stoppedAt) {
        return i18n.t(prefix + 'inProgress');
      } else if (releasedBytes >= bytesToRelease) {
        return i18n.t(prefix + 'success');
      } else {
        return i18n.t(prefix + 'failure');
      }
    }
  ),
});
