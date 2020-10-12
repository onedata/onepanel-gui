/**
 * A table cell used to display report status using oneicon.
 *
 * @module components/space-cleaning-reports/status-cell
 * @author Michal Borzecki
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  classNames: ['status-cell'],
  classNameBindings: ['record.status'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.spaceCleaningReports',

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
      const status = this.get('record.status');

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
        default:
          return 'warning';
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
      const status = this.get('record.status');

      return this.t(`statusValues.${status}`, {}, {
        defaultValue: this.t('statusValues.unknown'),
      });
    }
  ),
});
