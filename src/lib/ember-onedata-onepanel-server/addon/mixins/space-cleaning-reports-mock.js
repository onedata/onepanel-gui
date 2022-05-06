/**
 * Adds a mocked "live" cleaning reports collection
 *
 * When "collection starts work" it will generate new reports withe some interval
 * See `service:onepanel-server-mock` for example of usage.
 *
 * @module mixins/space-cleaning-reports-mock
 * @author Jakub Liput
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Mixin from '@ember/object/mixin';
import Onepanel from 'npm:onepanel';
import moment from 'moment';
import _ from 'lodash';
import { get, set, setProperties } from '@ember/object';
import { later } from '@ember/runloop';

const {
  SpaceAutoCleaningReports,
  SpaceAutoCleaningReport,
} = Onepanel;

let globalReportIndex = 10000;
const cleaningTime = 10000;

function genReportIndex() {
  const index = globalReportIndex--;
  return [index, `r${_.padStart(index, 6, '0')}`];
}

class ReportsCollection {
  constructor(initialReports = []) {
    this.intervalId = setInterval(this.addReport.bind(this), cleaningTime + 5000);
    this.reports = [...initialReports];
  }
  addReport() {
    const lastReport = this.reports[this.reports.length - 1];
    const firstReport = this.reports[0];
    if (firstReport && firstReport.status !== 'active') {
      if (lastReport) {
        set(lastReport, 'releasedBytes', get(lastReport, 'bytesToRelease'));
        set(lastReport, 'stoppedAt', moment().subtract(2, 's'));
      }
      const [index, id] = genReportIndex();
      const now = moment(index).toISOString();
      const report = SpaceAutoCleaningReport.constructFromObject({
        id,
        index,
        startedAt: now,
        releasedBytes: Math.pow(1024, 3) * 4,
        bytesToRelease: Math.pow(1024, 3) * 5,
        filesNumber: 50,
        status: 'active',
      });
      this.reports.unshift(report);
      later(this.finishReport.bind(this), cleaningTime);
    }
  }
  destroy() {
    clearInterval(this.intervalId);
  }
  getIds(index, limit = 100000000, offset = 0) {
    let arrIndex = _.findIndex(this.reports, i => get(i, 'index') === index);
    if (arrIndex === -1) {
      arrIndex = 0;
    }
    const ids = this.reports.slice(arrIndex + offset, arrIndex + offset + limit)
      .mapBy('id');
    return SpaceAutoCleaningReports.constructFromObject({
      ids,
    });
  }
  getReport(reportId) {
    return this.reports.find(r => get(r, 'id') === reportId);
  }
  cancelReport() {
    const firstReport = this.reports[0];
    if (firstReport && firstReport.status === 'active') {
      set(firstReport, 'status', 'cancelled');
    }
  }
  finishReport() {
    const firstReport = this.reports[0];
    const now = moment(Number(get(firstReport, 'index'))).toISOString();
    if (firstReport && firstReport.status === 'active') {
      setProperties(firstReport, {
        status: 'failed',
        stoppedAt: now,
      });
    }
  }
}

export default Mixin.create({
  init() {
    this._super(...arguments);
    this.set('reports', {});
  },

  _addReport(spaceId) {
    const reports = this.get('reports');
    const report = reports[spaceId];
    report.addReport();
  },

  _changeStatusToCancelled(spaceId) {
    const reports = this.get('reports');
    const report = reports[spaceId];
    report.cancelReport();
  },

  _genReport(duration = 1, isSuccess = true, lastRunStatus = 'completed') {
    const [index, id] = genReportIndex();
    const now = moment(index);
    const stoppedAt = now.subtract(1, 's').toISOString();
    const startedAt = now.subtract(duration, 'h').toISOString();
    return {
      id,
      index,
      startedAt,
      stoppedAt: (lastRunStatus === 'completed' ? stoppedAt : null),
      releasedBytes: 1024 * 1024 * (isSuccess ? 75 : 50),
      bytesToRelease: 1024 * 1024 * 75,
      filesNumber: 80,
      status: (isSuccess ? 'completed' : 'failed'),
    };
  },

  _getReportIds(spaceId, index, limit, offset) {
    return this._getReportCollection(spaceId).getIds(index, limit, offset);
  },

  _getReport(spaceId, reportId) {
    return this._getReportCollection(spaceId).getReport(reportId);
  },

  _getReportCollection(spaceId) {
    const reports = this.get('reports');
    let report = reports[spaceId];
    if (!report) {
      report = new ReportsCollection([
        this._genReport(2, true),
      ].concat(_.times(1000, i => this._genReport(i + 3, false))).reverse());
      // uncomment code below to have empty reports collection on start
      // report = new ReportsCollection([]);
      reports[spaceId] = report;
    }
    return report;
  },
});
