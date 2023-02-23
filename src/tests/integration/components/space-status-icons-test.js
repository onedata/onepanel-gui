import EmberObject from '@ember/object';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import OneTooltipHelper from '../../helpers/one-tooltip';
import moment from 'moment';
import dom from 'onedata-gui-common/utils/dom';

describe('Integration | Component | space-status-icons', function () {
  setupRenderingTest();

  it(
    'does not render status toolbar if storage import is disabled',
    async function () {
      this.set('space', EmberObject.create({
        storageImportEnabled: false,
      }));

      await render(hbs `{{space-status-icons space=space}}`);

      expect(dom.isHidden(find('.space-status-icons'))).to.be.true;
    }
  );

  it(
    'shows import icon when storage import is enabled',
    async function () {
      this.set('space', EmberObject.create({
        storageImportEnabled: true,
      }));

      await render(hbs `{{space-status-icons space=space}}`);

      expect(dom.isVisible(find('.oneicon-space-import'))).to.be.true;
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
    it(`shows "${status}"${status === '' ? ' (incorrect)' : ''} auto storage import status`, async function () {
      this.setProperties({
        space: EmberObject.create({
          storageImportEnabled: true,
        }),
        importInfo: { status },
      });

      await render(hbs `{{space-status-icons space=space importInfo=importInfo}}`);

      const importIcon = find('.status-toolbar-icon');
      const tipHelper = new OneTooltipHelper(importIcon);
      classes.forEach(cssClass => expect(importIcon).to.have.class(cssClass));

      return tipHelper.getText()
        .then(tipText => expect(tipText).to.equal(tip));
    });
  });

  it('shows manual storage import status', async function () {
    this.setProperties({
      space: EmberObject.create({
        storageImportEnabled: true,
        manualStorageImportEnabled: true,
      }),
    });

    await render(hbs `{{space-status-icons space=space}}`);

    const tipHelper = new OneTooltipHelper(find('.status-toolbar-icon'));
    return tipHelper.getText()
      .then(tipText => expect(tipText).to.equal('Manual import enabled'));
  });

  it('shows next storage import scan time info', async function () {
    const nextScanMoment = moment().add(1, 'h');
    this.setProperties({
      space: EmberObject.create({
        storageImportEnabled: true,
        autoStorageImportEnabled: true,
      }),
      importInfo: { status: 'completed', nextScan: nextScanMoment.unix() },
    });

    await render(hbs `{{space-status-icons space=space importInfo=importInfo}}`);

    const tipHelper = new OneTooltipHelper(find('.status-toolbar-icon'));
    return tipHelper.getText()
      .then(tipText => expect(tipText).to.equal(
        `Auto import scan completed, next scan: ${nextScanMoment.format('H:mm:ss')}`
      ));
  });
});
