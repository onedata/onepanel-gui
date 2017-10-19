/**
 * Adds a mocked "live" cleaning reports collection
 * 
 * When "collection starts work" it will generate new reports withe some interval
 * See `service:onepanel-server-mock` for example of usage.
 *
 * @module mixins/space-cleaning-reports-mock
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Mixin from '@ember/object/mixin';
import Onepanel from 'npm:onepanel';
import moment from 'moment';

const {
  SpaceAutoCleaningReportCollection,
  SpaceAutoCleaningReport,
} = Onepanel;

class ReportsCollection {
  constructor(initialReports = []) {
    this.intervalId = setInterval(this.addReport.bind(this), 10000);
    this.reports = [...initialReports];
  }
  addReport() {
    const report = SpaceAutoCleaningReport.constructFromObject({
      startedAt: moment().subtract(6, 's'),
      stoppedAt: moment().subtract(1, 's'),
      releasedBytes: Math.pow(1024, 3) * 5,
      bytesToRelease: Math.pow(1024, 3) * 5,
      filesNumber: 50,
    });
    this.reports.push(report);
  }
  destroy() {
    clearInterval(this.intervalId);
  }
  getData(startedAfter) {
    const reportEntries = this.reports
      .filter(r => moment(r.startedAt) > moment(startedAfter));
    return SpaceAutoCleaningReportCollection.constructFromObject({
      reportEntries,
    });
  }
}

export default Mixin.create({
  init() {
    this._super(...arguments);
    this.set('reports', []);
  },

  _genReport(duration = 1, isSuccess = true, inProgress = false) {
    let stoppedAt = moment().subtract(1, 's').toISOString();
    let startedAt = moment().subtract(duration, 'h').toISOString();

    return {
      startedAt,
      stoppedAt: (inProgress ? null : stoppedAt),
      releasedBytes: 1024 * 1024 * (isSuccess ? 75 : 50),
      bytesToRelease: 1024 * 1024 * 75,
      filesNumber: 80,
    };
  },

  _getReportsCollection(id, startedAt) {
    const reports = this.get('reports');
    let report = reports[id];
    if (!report) {
      report = new ReportsCollection([
        // TODO: test in progress report
        // this._genReport(1, false, true),
        this._genReport(2, true),
        this._genReport(3, false),
      ]);
      reports[id] = report;
    }
    return report.getData(startedAt);

  },
});
