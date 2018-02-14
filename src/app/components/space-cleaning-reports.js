/**
 * A table (or list in mobile view) for displaying information from space 
 * cleaning reports.
 *
 * @module components/space-cleaning-reports
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

import EmberObject, { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';
import moment from 'moment';
import bytesToString from 'onedata-gui-common/utils/bytes-to-string';

const START_END_TIME_FORMAT = 'D MMM YYYY H:mm:ss';

export default Component.extend({
  classNames: ['space-cleaning-reports'],

  i18n: service(),

  /**
   * Input data.
   * To inject.
   * @type {EmberArray.Object}
   */
  data: A([]),

  /**
   * If true, component is rendered in mobile mode.
   * @type {boolean}
   */
  _mobileMode: false,

  /**
   * Window object (for testing purposes).
   * @type {Window}
   */
  _window: window,

  /**
   * Data ready for display.
   * @type {computed.Array.Object}
   */
  _processedData: computed('data.[]', function () {
    let {
      i18n,
      data,
    } = this.getProperties('i18n', 'data');
    return data.map((report) => {
      report = EmberObject.create(report);

      let startedAt = moment(report.get('startedAt'));
      report.setProperties({
        startedAtReadable: startedAt.format(START_END_TIME_FORMAT),
        startedAtSortable: startedAt.unix(),
      });

      let stoppedAt = report.get('stoppedAt');
      if (stoppedAt) {
        stoppedAt = moment(stoppedAt);
        report.setProperties({
          stoppedAtReadable: stoppedAt.format(START_END_TIME_FORMAT),
          stoppedAtSortable: stoppedAt.unix(),
        });
      } else {
        report.setProperties({
          stoppedAtReadable: '-',
          // bigger than any unix timestamp
          stoppedAtSortable: 9999999999,
        });
      }

      let released = bytesToString(report.get('releasedBytes'), { iecFormat: true });
      let outOf = i18n.t('components.spaceCleaningReports.releasedBytesOutOf');
      let planned = bytesToString(
        report.get('bytesToRelease'), { iecFormat: true }
      );
      report.set('releasedBytesReadable', `${released} (${outOf} ${planned})`);
      return report;
    });
  }),

  /**
   * Custom classes for ember-models-table addon.
   * @type {Ember.Object}
   */
  _tableCustomClasses: computed(function () {
    return EmberObject.create({
      table: 'table',
    });
  }),

  /**
   * Custom messages for ember-models-table addon.
   * @type {Ember.Object}
   */
  _tableCustomMessages: computed('noDataToShowMessage', function () {
    return EmberObject.create({
      noDataToShow: this.get('i18n').t(
        'components.spaceCleaningReports.noReportsAvailable'),
    });
  }),

  /**
   * Columns definition for table.
   * @type {computed.Array.Object}
   */
  _columns: computed(function () {
    let i18n = this.get('i18n');
    return [{
      propertyName: 'startedAtReadable',
      sortedBy: 'startedAtSortable',
      sortPrecedence: 1,
      sortDirection: 'desc',
      title: i18n.t('components.spaceCleaningReports.start'),
    }, {
      propertyName: 'stoppedAtReadable',
      sortedBy: 'stoppedAtSortable',
      title: i18n.t('components.spaceCleaningReports.stop'),
    }, {
      propertyName: 'releasedBytesReadable',
      sortedBy: 'releasedBytes',
      title: i18n.t('components.spaceCleaningReports.releasedBytes'),
    }, {
      propertyName: 'filesNumber',
      title: i18n.t('components.spaceCleaningReports.filesNumber'),
    }, {
      propertyName: 'status',
      title: i18n.t('components.spaceCleaningReports.status'),
      component: 'space-cleaning-reports/status-cell',
    }];
  }),

  /**
   * Columns definition for mobile view.
   * @type {ComputedProperty<Array<Object>>}
   */
  _mobileColumns: computed('_columns', function () {
    let _columns = this.get('_columns');
    return _columns.slice(0, _columns.length - 1);
  }),

  /**
   * Window resize event handler.
   * @type {computed.Function}
   */
  _resizeEventHandler: computed(function () {
    return () => {
      this.set('_mobileMode', this.get('_window.innerWidth') < 768);
    };
  }),

  init() {
    this._super(...arguments);

    let {
      _resizeEventHandler,
      _window,
    } = this.getProperties('_resizeEventHandler', '_window');

    _resizeEventHandler();
    _window.addEventListener('resize', _resizeEventHandler);
  },

  willDestroyElement() {
    try {
      let {
        _resizeEventHandler,
        _window,
      } = this.getProperties('_resizeEventHandler', '_window');
      _window.removeEventListener('resize', _resizeEventHandler);
    } finally {
      this._super(...arguments);
    }
  },
});
