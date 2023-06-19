/**
 * Mocks live statistics and status changes for storage import
 *
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Mixin from '@ember/object/mixin';

import { get } from '@ember/object';
import _ from 'lodash';

const PERIODS = [
  'minute',
  'hour',
  'day',
];

const METRICS = [
  'queueLength',
  'createdFiles',
  'modifiedFiles',
  'deletedFiles',
];

const SAMPLES_COUNT = 12;

function randomValue() {
  return _.random(0, 10);
}

export default Mixin.create({
  allStats: null,

  _statusTimerId: null,

  globalImportStatus: 'running',

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
    const {
      statusChangeTimerId,
      statsPushIntervalIds,
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
    const allStats = _.zipObject(PERIODS, PERIODS.map(() => {
      return _.zipObject(METRICS, METRICS.map(() => {
        return _.times(SAMPLES_COUNT, randomValue);
      }));
    }));

    this.setProperties({ allStats });
  },

  initAutoStatsPush() {
    const allStats = this.get('allStats');
    const sampling = {
      minute: 60000 / SAMPLES_COUNT,
      hour: (60 * 60000) / SAMPLES_COUNT,
      day: (24 * 60 * 60000) / SAMPLES_COUNT,
    };
    const statsPushIntervalIds = [];
    _.keys(sampling).forEach(period => {
      const interval = sampling[period];
      statsPushIntervalIds.push(setInterval(() => {
        _.keys(allStats[period]).forEach(metric => {
          const values = allStats[period][metric].slice(0);
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
    const statusChangeTimerId = setTimeout(() => {
      this.set('globalImportStatus', 'completed');
    }, delay);
    this.set('statusChangeTimerId', statusChangeTimerId);
  },

  generateStorageImportInfo(space) {
    const status = this.get('globalImportStatus');
    if (get(space, 'storageImport') == null) {
      return null;
    } else {
      const nowTimestamp = Math.floor((new Date().valueOf() / 1000));
      return {
        status,
        start: nowTimestamp - 3600,
        stop: status === 'completed' ? nowTimestamp : null,
        createdFiles: 1000,
        modifiedFiles: 500,
        unmodifiedFiles: 300,
        deletedFiles: 250,
        failedFiles: 1,
        nextScan: Math.floor((new Date().valueOf() / 1000)) + 7200,
      };
    }
  },

  generateStorageImportStats(space, period, metrics) {
    const metricsArray = typeof metrics === 'string' ? metrics.split(',') : metrics;
    if (get(space, 'storageImport') == null) {
      return null;
    } else {
      const {
        allStats,
        lastValueDate,
      } = this.getProperties(
        'allStats',
        'lastValueDate'
      );

      if (period && metricsArray) {
        return _.zipObject(metricsArray, metricsArray.map(metric => ({
          values: allStats[period][metric],
          lastValueDate: lastValueDate.toJSON(),
        })));
      }
    }
  },
});
