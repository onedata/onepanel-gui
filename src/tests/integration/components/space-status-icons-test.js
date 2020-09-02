import EmberObject from '@ember/object';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import OneTooltipHelper from '../../helpers/one-tooltip';
import moment from 'moment';

describe('Integration | Component | space status icons', function () {
  setupComponentTest('space-status-icons', {
    integration: true,
  });

  it(
    'does not render status toolbar if storage import is disabled',
    function () {
      this.set('space', EmberObject.create({
        storageImportEnabled: false,
      }));

      this.render(hbs `{{space-status-icons space=space}}`);

      expect(this.$('.space-status-icons')).to.be.hidden;
    }
  );

  it(
    'shows import icon when storage import is enabled',
    function () {
      this.set('space', EmberObject.create({
        storageImportEnabled: true,
      }));

      this.render(hbs `{{space-status-icons space=space}}`);

      expect(this.$('.oneicon-space-import')).to.be.visible;
    }
  );

  [{
    status: 'enqueued',
    tip: 'Auto import scan enqueued',
    classes: ['animated', 'infinite', 'semi-hinge', 'pulse-mint'],
  }, {
    status: 'running',
    tip: 'Auto import scan is running',
    classes: ['animated', 'infinite', 'semi-hinge', 'pulse-mint'],
  }, {
    status: 'aborting',
    tip: 'Auto import scan is aborting',
    classes: ['animated', 'infinite', 'semi-hinge', 'pulse-orange'],
  }, {
    status: 'completed',
    tip: 'Auto import scan completed',
    classes: ['text-success'],
  }, {
    status: 'failed',
    tip: 'Auto import scan failed',
    classes: ['text-danger'],
  }, {
    status: 'aborted',
    tip: 'Auto import scan aborted',
    classes: ['text-danger'],
  }, {
    status: '',
    tip: 'Auto import enabled',
    classes: [],
  }].forEach(({ status, tip, classes }) => {
    it(`shows "${status}"${status === '' ? ' (incorrect)' : ''} auto storage import status`, function () {
      this.setProperties({
        space: EmberObject.create({
          storageImportEnabled: true,
        }),
        importStats: { status },
      });

      this.render(hbs `{{space-status-icons space=space importStats=importStats}}`);

      const $importIcon = this.$('.status-toolbar-icon').eq(0);
      const tipHelper = new OneTooltipHelper($importIcon[0]);
      classes.forEach(cssClass => expect($importIcon).to.have.class(cssClass));

      return tipHelper.getText()
        .then(tipText => expect(tipText).to.equal(tip));
    });
  });

  it('shows manual storage import status', function () {
    this.setProperties({
      space: EmberObject.create({
        storageImportEnabled: true,
        manualStorageImportEnabled: true,
      }),
    });

    this.render(hbs `{{space-status-icons space=space}}`);

    const tipHelper = new OneTooltipHelper(this.$('.status-toolbar-icon')[0]);
    return tipHelper.getText()
      .then(tipText => expect(tipText).to.equal('Manual import enabled'));
  });

  it('shows next storage import scan time info', function () {
    const nextScanMoment = moment().add(1, 'h');
    this.setProperties({
      space: EmberObject.create({
        storageImportEnabled: true,
        autoStorageImportEnabled: true,
      }),
      importStats: { status: 'completed', nextScan: nextScanMoment.unix() },
    });

    this.render(hbs `{{space-status-icons space=space importStats=importStats}}`);

    const tipHelper = new OneTooltipHelper(this.$('.status-toolbar-icon')[0]);
    return tipHelper.getText()
      .then(tipText => expect(tipText).to.equal(
        `Auto import scan completed, next scan: ${nextScanMoment.format('H:mm:ss')}`
      ));
  });
});
