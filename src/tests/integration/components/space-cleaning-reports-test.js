import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import { resolve } from 'rsvp';
import wait from 'ember-test-helpers/wait';
import { click } from 'ember-native-dom-helpers';
import { get } from '@ember/object';
import _ from 'lodash';
import Service from '@ember/service';
import { lookupService, registerService } from '../../helpers/stub-service';
import sinon from 'sinon';

const START_END_TIME_FORMAT = 'D MMM YYYY H:mm:ss';

const data = Object.freeze([{
  id: 'id-0',
  index: 0,
  startedAt: new Date(),
  stoppedAt: new Date(),
  releasedBytes: 1048576,
  bytesToRelease: 2097152,
  filesNumber: 991,
  status: 'failed',
}, {
  id: 'id-1',
  index: 1,
  startedAt: new Date(),
  stoppedAt: new Date(),
  releasedBytes: 1022976,
  bytesToRelease: 1022976,
  filesNumber: 992,
  status: 'completed',
}]);

function fetchReports(spaceId, index, limit = 1000, offset = 0) {
  let arrIndex = _.findIndex(data, i => get(i, 'index') === index);
  if (arrIndex === -1) {
    arrIndex = 0;
  }
  return resolve(_.cloneDeep(data.slice(
    arrIndex + offset,
    arrIndex + offset + limit
  )));
}

const SpaceManager = Service.extend({
  getAutoCleaningReports: fetchReports,
});

describe('Integration | Component | space cleaning reports', function () {
  setupRenderingTest();

  beforeEach(function () {
    registerService(this, 'spaceManager', SpaceManager);
    this.set('_window', {
      innerWidth: 1366,
      addEventListener() {},
      removeEventListener() {},
    });
  });

  it('renders reports in desktop mode', async function () {
    this.set('_window.innerWidth', 1366);

    await render(hbs `<div class="col-content">
      {{space-cleaning-reports
        spaceId="space_id1"
        isCleanEnabled=true
        _window=_window
      }}
    </div>`);

    await wait();

    expect(this.$('tbody tr.data-row'), 'data rows').to.have.length(2);
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

  it('renders reports in mobile view', async function () {
    this.set('_window.innerWidth', 600);

    await render(hbs `<div class="col-content">
      {{space-cleaning-reports
        spaceId="space_id1"
        isCleanEnabled=true
        _window=_window
      }}
    </div>`);

    await wait();

    expect(this.$('.one-collapsible-list .data-row')).to.have.length(2);

    await click(
      '.one-collapsible-list-item:last-child .one-collapsible-list-item-header'
    );

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

  it('renders message about no reports', async function () {
    sinon
      .stub(lookupService(this, 'spaceManager'), 'getAutoCleaningReports').resolves([]);

    await render(hbs `<div class="col-content">
      {{space-cleaning-reports
        spaceId="space_id1"
        isCleanEnabled=true
        _window=_window
      }}
    </div>`);
    await wait();

    const $noDataRow = this.$('.no-data-row');
    expect($noDataRow).to.exist;
    expect($noDataRow).to.contain('No reports available.');
  });

});
