// TODO: VFS-9257 fix eslint issues in this file
/* eslint-disable no-param-reassign */

/**
 * A base component for all space import/update import statistics charts.
 * Needs timeStats (chart data), lastUpdateTime and timeUnit to be injected.
 *
 * @module components/storage-import-chart-base
 * @author Michal Borzecki, Jakub Liput
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { reads } from '@ember/object/computed';

import Component from '@ember/component';
import { computed } from '@ember/object';
import moment from 'moment';
import _ from 'lodash';
import $ from 'jquery';
import dom from 'onedata-gui-common/utils/dom';

import StorageImportChartDataValidator from 'onepanel-gui/mixins/components/storage-import-chart-data-validator';

export default Component.extend(StorageImportChartDataValidator, {
  classNames: ['storage-import-chart-base'],

  /**
   * To inject.
   * @type {Array.Onepanel.TimeStats}
   */
  timeStats: null,

  /**
   * To inject.
   * @type {string}
   */
  timeUnit: 'minute',

  /**
   * A date on right side of the chart
   * @type {Date}
   */
  lastUpdateTime: reads('timeStats.firstObject.lastValueDate'),

  emptyTimePeriod: computed('timeParts', function () {
    return _.times(this.get('timeParts'), () => 0);
  }),

  timeParts: computed('timeStats', function () {
    const timeStats = this.get('timeStats');
    let len = 0;
    if (timeStats) {
      const nonEmptyTimeStats = _.find(timeStats, ts =>
        ts && Array.isArray(ts.values) && ts.values.length > 0
      );
      if (nonEmptyTimeStats.values.length) {
        len = nonEmptyTimeStats.values.length;
      }
    }
    return len;
  }),

  timePeriod: computed('timeParts', function () {
    const timeParts = this.get('timeParts');
    return timeParts ? 1 / timeParts : 1 / 12;
  }),

  timeFormat: computed('timeUnit', function () {
    switch (this.get('timeUnit')) {
      case 'hour':
        return 'HH:mm';
      case 'day':
        return 'DD/MM HH:mm';
      default:
        return 'HH:mm:ss';
    }
  }),

  /**
   * @type {Ember.ComputedProperty<function>}
   */
  chartScrollHandler: computed(function () {
    return () => this.handleChartScroll();
  }),

  didInsertElement() {
    this._super(...arguments);
    this.getScrollableRow().scroll(this.get('chartScrollHandler'));
  },

  willDestroyElement() {
    try {
      this.getScrollableRow().off('scroll', this.get('chartScrollHandler'));
    } finally {
      this._super(...arguments);
    }
  },

  getScrollableRow() {
    return $(this.get('element')).find('.scrollable-row');
  },

  getChartLabel(offset) {
    let {
      lastUpdateTime,
      timeFormat,
      timePeriod,
      timeUnit,
    } = this.getProperties(
      'lastUpdateTime',
      'timeFormat',
      'timePeriod',
      'timeUnit');
    if (timeUnit === 'day') {
      timeUnit = 'hour';
      offset *= 24;
    }
    return moment(lastUpdateTime)
      .subtract(offset * timePeriod, timeUnit + 's')
      .format(timeFormat);
  },

  /**
   * Hides chart tooltip on scroll and translates tooltip position
   * according to x-scroll.
   */
  handleChartScroll() {
    const offsetX = this.getScrollableRow().scrollLeft();
    const chartTooltip = this.element?.querySelector('.chart-tooltip');
    if (chartTooltip) {
      dom.setStyle(
        chartTooltip,
        'transform',
        `translateY(-100%) translateX(-50%) translateX(${-offsetX}px)`
      );
      chartTooltip.classList.remove('active');
    }
  },
});
