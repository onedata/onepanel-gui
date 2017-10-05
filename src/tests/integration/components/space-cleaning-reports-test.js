import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import { click } from 'ember-native-dom-helpers';

const START_END_TIME_FORMAT = 'D MMM YYYY H:mm';

describe('Integration | Component | space cleaning reports', function () {
  setupComponentTest('space-cleaning-reports', {
    integration: true,
  });

  beforeEach(function () {
    this.set('data', [{
      startedAt: new Date(),
      stoppedAt: new Date(),
      releasedBytes: 1048576,
      bytesToRelease: 2097152,
      filesNumber: 24,
      status: 'success',
    }, {
      startedAt: new Date(),
      stoppedAt: new Date(),
      releasedBytes: 1022976,
      bytesToRelease: 1022976,
      filesNumber: 18,
      status: 'failure',
    }]);
    this.set('_window', {
      innerWidth: 1000,
      addEventListener() {},
      removeEventListener() {},
    });
  });

  it('renders reports', function () {
    const data = this.get('data');
    this.render(hbs `{{space-cleaning-reports data=data _window=_window}}`);

    expect(this.$('tbody tr')).to.have.length(2);
    const cells = this.$('tbody tr:first-child td');
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

  it('renders reports in mobile view', function () {
    this.set('_window.innerWidth', 500);
    const data = this.get('data');
    this.render(hbs `{{space-cleaning-reports data=data _window=_window}}`);

    expect(this.$('.one-collapsible-list li')).to.have.length(2);
    const cells = this.$(
      '.one-collapsible-list-item:last-child .item-table .content-row .one-label'
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
    expect(this.$('.one-collapsible-list-item:last-child .item-table ' +
      '.content-row:last-child .oneicon.oneicon-checkbox-filled')).to.exist;
  });

  it('renders message about no reports', function () {
    this.set('data', []);
    this.render(hbs `{{space-cleaning-reports data=data _window=_window}}`);

    expect(this.$('tbody tr')).to.have.length(1);
    expect(this.$('tbody td')).to.contain('No reports available.');
  });

  it('allows to sort released size using raw bytes number', function (done) {
    this.render(hbs `{{space-cleaning-reports data=data _window=_window}}`);

    const releasedTh = this.$('th:nth-child(3)')[0];
    click(releasedTh).then(() => {
      click(releasedTh).then(() => {
        expect(this.$('tbody tr:first-child td:nth-child(3)'))
          .to.contain('1 MiB');
        done();
      });
    });
  });
});
