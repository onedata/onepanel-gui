import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import { resolve } from 'rsvp';
import wait from 'ember-test-helpers/wait';
import { click } from 'ember-native-dom-helpers';
import { get } from '@ember/object';
import _ from 'lodash';
import Service from '@ember/service';
import { registerService } from '../../helpers/stub-service';

const START_END_TIME_FORMAT = 'D MMM YYYY H:mm:ss';

const data = [{
  id: 'id-0',
  index: 0,
  startedAt: new Date(),
  stoppedAt: new Date(),
  releasedBytes: 1048576,
  bytesToRelease: 2097152,
  filesNumber: 991,
  status: 'success',
}, {
  id: 'id-1',
  index: 1,
  startedAt: new Date(),
  stoppedAt: new Date(),
  releasedBytes: 1022976,
  bytesToRelease: 1022976,
  filesNumber: 992,
  status: 'failure',
}];

function fetchReports(index, limit = 1000, offset = 0) {
  let arrIndex = _.findIndex(this.reports, i => get(i, 'index') === index);
  if (arrIndex === -1) {
    arrIndex = 0;
  }
  return resolve(data.slice(
    arrIndex + offset,
    arrIndex + offset + limit
  ));
}

const SpaceManager = Service.extend({
  getAutoCleaningReports: fetchReports,
});

describe('Integration | Component | space cleaning reports', function () {
  setupComponentTest('space-cleaning-reports', {
    integration: true,
  });

  beforeEach(function () {
    registerService(this, 'spaceManager', SpaceManager);

    this.set('data', data);

    this.set('_window', {
      innerWidth: 1000,
      addEventListener() {},
      removeEventListener() {},
    });

    this.on('nop', () => {});

    this.on('fetchReports', fetchReports);
  });

  it('renders reports', function () {
    const data = this.get('data');
    this.on('fetchReports', () => resolve(data));
    this.render(hbs `<div class="col-content">
      {{space-cleaning-reports
        spaceId="space_id1"
        isCleanEnabled=true
        fetchReports=(action "fetchReports")
        _window=_window
      }}
    </div>`);

    return wait().then(() => {
      expect(this.$('tbody tr.data-row')).to.have.length(2);
      const cells = this.$('tbody tr.data-row:first td');
      const cellsValues = [
        moment(data[0].startedAt).format(START_END_TIME_FORMAT),
        moment(data[0].stoppedAt).format(START_END_TIME_FORMAT),
        '1 MiB (out of 2 MiB)',
        String(data[0].filesNumber),
      ];
      cellsValues.forEach((value, index) =>
        expect(cells.eq(index).text().trim()).to.be.equal(value)
      );
      expect(cells.eq(4).find('.oneicon.oneicon-checkbox-filled-x')).to.exist;
      expect(this.$(
        'tbody tr:last-child td:last-child .oneicon.oneicon-checkbox-filled'
      )).to.exist;
    });
  });

  it('renders reports in mobile view', function () {
    this.set('_window.innerWidth', 500);
    const data = this.get('data');
    this.on('fetchReports', () => resolve(data));
    this.render(hbs `<div class="col-content">
      {{space-cleaning-reports
        spaceId="space_id1"
        isCleanEnabled=true
        fetchReports=(action "fetchReports")
        _window=_window
      }}
    </div>`);

    return wait().then(() => {
      expect(this.$('.one-collapsible-list .data-row')).to.have.length(2);
      return click(
        '.one-collapsible-list-item:last-child .one-collapsible-list-item-header'
      ).then(() => {
        const cells = this.$(
          '.one-collapsible-list-item:last-child .one-collapsible-list-item-content .one-label'
        );
        const cellsValues = [
          moment(data[1].startedAt).format(START_END_TIME_FORMAT),
          moment(data[1].stoppedAt).format(START_END_TIME_FORMAT),
          '999 KiB (out of 999 KiB)',
          String(data[1].filesNumber),
        ];
        cellsValues.forEach((value, index) =>
          expect(cells.eq(index).text().trim()).to.be.equal(value)
        );
        expect(this.$('.one-collapsible-list-item:last-child' +
            ' .one-collapsible-list-item-header .oneicon.oneicon-checkbox-filled'
          ))
          .to.exist;
      });
    });
  });

  it('renders message about no reports', function () {
    this.on('fetchReports', () => resolve([]));
    this.render(hbs `<div class="col-content">
      {{space-cleaning-reports
        spaceId="space_id1"
        isCleanEnabled=true
        fetchReports=(action "fetchReports")
        _window=_window
      }}
    </div>`);

    return wait().then(() => {
      const $noDataRow = this.$('.no-data-row');
      expect($noDataRow).to.exist;
      expect($noDataRow).to.contain('No reports available.');
    });
  });

});
