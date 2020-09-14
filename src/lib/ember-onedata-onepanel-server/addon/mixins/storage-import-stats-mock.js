/**
 * Mocks live statistics and status changes for storage import
 *
 * @module mixins/storage-import-stats-mock
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
    let {
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
      day: (24 * 60 * 60000) / SAMPLES_COUNT,
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
      this.set('globalImportStatus', 'completed');
    }, delay);
    this.set('statusChangeTimerId', statusChangeTimerId);
  },

  generateStorageImportInfo(space) {
    if (get(space, 'storageImport') == null) {
      return null;
    } else {
      const nowTimestamp = Math.floor((new Date().valueOf() / 1000));
      return {
        status: this.get('globalImportStatus'),
        start: nowTimestamp - 3600,
        stop: null,
        importedFiles: 1000,
        updatedFiles: 500,
        deletedFiles: 250,
        nextScan: Math.floor((new Date().valueOf() / 1000)) + 7200,
      };
    }
  },

  generateStorageImportStats(space, period, metrics) {
    if (typeof metrics === 'string') {
      metrics = metrics.split(',');
    }
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

      if (period && metrics) {
        return _.zipObject(metrics, metrics.map(metric => ({
          values: allStats[period][metric],
          lastValueDate: lastValueDate.toJSON(),
        })));
      }
    }
  },
});
