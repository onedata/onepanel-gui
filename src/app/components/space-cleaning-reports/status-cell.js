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
  computed,
  inject: {
    service,
  },
} = Ember;

export default Ember.Component.extend({
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
   * Status value.
   * Will be initialized by bindStatusProperty.
   * @type {computed.string}
   */
  _status: null,

  /**
   * Icon name.
   * @type {computed.string}
   */
  _iconName: computed(
    'record.{stoppedAt,releasedSize,plannedReleasedSize}',
    function () {
      let {
        stoppedAt,
        releasedSize,
        plannedReleasedSize,
      } = this.get('record').getProperties(
        'stoppedAt',
        'releasedSize',
        'plannedReleasedSize'
      );
      if (!stoppedAt) {
        return 'update';
      } else if (releasedSize === plannedReleasedSize) {
        return 'checkbox-filled';
      } else {
        return 'checkbox-filled-x';
      }
    }
  ),

  _tip: computed(
    'record.{stoppedAt,releasedSize,plannedReleasedSize}',
    function () {
      let {
        i18n,
        record,
      } = this.getProperties('i18n', 'record');
      let {
        stoppedAt,
        releasedSize,
        plannedReleasedSize,
      } = record.getProperties(
        'stoppedAt',
        'releasedSize',
        'plannedReleasedSize'
      );
      const prefix = 'components.spaceCleaningReports.statusValues.';
      if (!stoppedAt) {
        return i18n.t(prefix + 'inProgress');
      } else if (releasedSize === plannedReleasedSize) {
        return i18n.t(prefix + 'success');
      } else {
        return i18n.t(prefix + 'failure');
      }
    }
  ),
});
