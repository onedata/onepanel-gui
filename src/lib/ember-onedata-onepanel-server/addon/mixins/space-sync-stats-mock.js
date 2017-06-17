/**
 * Mocks live statistics and status changes for space sync 
 *
 * @module mixins/space-sync-stats-mock
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import _ from 'lodash';

const {
  Mixin,
  get,
} = Ember;

const PERIODS = [
  'minute',
  'hour',
  'day',
];

const METRICS = [
  'queueLength',
  'insertCount',
  'updateCount',
  'deleteCount',
];

const SAMPLES_COUNT = 12;

function randomValue() {
  return _.random(0, 10);
}

export default Mixin.create({
  allStats: null,

  globalImportStatus: 'inProgress',
  globalUpdateStatus: 'waiting',

  init() {
    this._super(...arguments);

    this.initAllStats();
    this.initAutoStatsPush();
    this.initDelayedStatusChange();
  },

  /**
   * Creates an object with mocked stastic values:
   * ```
   * {
   *   <period in PERIODS>: [
   *     <metric in METRICS>: [<SAMPLES_COUNT random values>]
   *   ]
   * }
   * ```
   */
  initAllStats() {
    let allStats = _.zipObject(PERIODS, PERIODS.map(() => {
      return _.zipObject(METRICS, METRICS.map(() => {
        return _.times(SAMPLES_COUNT, randomValue);
      }));
    }));

    this.setProperties({ allStats });
  },

  initAutoStatsPush() {
    let allStats = this.get('allStats');
    let sampling = {
      minute: 60000 / SAMPLES_COUNT,
      hour: (60 * 60000) / SAMPLES_COUNT,
      day: (24 * 60 * 60000) / SAMPLES_COUNT
    };
    _.keys(sampling).forEach(period => {
      let interval = sampling[period];
      setInterval(() => {
        _.keys(allStats[period]).forEach(metric => {
          let values = allStats[period][metric].slice(0);
          values.shift();
          values.push(randomValue());
          allStats[period][metric] = values;
        });
      }, interval);
    });
  },

  initDelayedStatusChange(delay = 10000) {
    setTimeout(() => {
      this.setProperties({
        globalImportStatus: 'done',
        globalUpdateStatus: 'inProgress',
      });
    }, delay);
  },

  generateSpaceSyncStats(space, period, metrics) {
    if (get(space, 'storageImport') == null) {
      return null;
    } else {
      let {
        allStats,
        globalImportStatus,
        globalUpdateStatus,
      } = this.getProperties('allStats', 'globalImportStatus', 'globalUpdateStatus');

      let stats;
      if (period && metrics) {
        stats = metrics.map(metric => ({
          name: metric,
          values: allStats[period][metric]
        }));
      }

      return {
        importStatus: globalImportStatus,
        updateStatus: globalUpdateStatus,
        period,
        stats,
      };
    }
  }
});
