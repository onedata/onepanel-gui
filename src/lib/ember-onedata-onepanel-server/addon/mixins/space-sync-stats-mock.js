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

  _statusTimerId: null,

  globalImportStatus: 'inProgress',
  globalUpdateStatus: 'waiting',

  lastValueDate: null,

  /**
   * Id of setTimeout for delayed status change
   * @type {Number}
   */
  statusChangeTimerId: null,

  /**
   * Ids of setInterval for auto stats push workers
   * @type {Array.number}
   */
  statsPushIntervalIds: null,

  init() {
    this._super(...arguments);

    this.set('lastValueDate', new Date());
    this.initAllStats();
    this.initAutoStatsPush();
    this.initDelayedStatusChange();
  },

  willDestroy() {
    let {
      statusChangeTimerId,
      statsPushIntervalIds
    } = this.getProperties(
      'statusChangeTimerId',
      'statsPushIntervalIds'
    );
    clearTimeout(statusChangeTimerId);
    statsPushIntervalIds.forEach(id => clearInterval(id));
    this._super(...arguments);
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
    let statsPushIntervalIds = [];
    _.keys(sampling).forEach(period => {
      let interval = sampling[period];
      statsPushIntervalIds.push(setInterval(() => {
        _.keys(allStats[period]).forEach(metric => {
          let values = allStats[period][metric].slice(0);
          values.shift();
          values.push(randomValue());
          allStats[period][metric] = values;
        });
        this.set('lastValueDate', new Date());
      }, interval));
    });
    this.set('statsPushIntervalIds', statsPushIntervalIds);
  },

  initDelayedStatusChange(delay = 10000) {
    let statusChangeTimerId = setTimeout(() => {
      this.setProperties({
        globalImportStatus: 'done',
        globalUpdateStatus: 'inProgress',
      });
    }, delay);
    this.set('statusChangeTimerId', statusChangeTimerId);
  },

  generateSpaceSyncStats(space, period, metrics) {
    if (typeof metrics === 'string') {
      metrics = metrics.split(',');
    }
    if (get(space, 'storageImport') == null) {
      return null;
    } else {
      let {
        allStats,
        globalImportStatus,
        globalUpdateStatus,
        lastValueDate,
      } = this.getProperties('allStats',
        'globalImportStatus',
        'globalUpdateStatus',
        'lastValueDate'
      );

      let stats;
      if (period && metrics) {
        stats = _.zipObject(metrics, metrics.map(metric => ({
          name: metric,
          values: allStats[period][metric],
          lastValueDate: lastValueDate.toJSON(),
        })));
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
