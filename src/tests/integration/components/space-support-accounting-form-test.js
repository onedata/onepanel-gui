import { expect } from 'chai';
import { describe, context, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { render, settled, find, click } from '@ember/test-helpers';
import sinon from 'sinon';
import OneTooltipHelper from '../../helpers/one-tooltip';

describe('Integration | Component | space-support-accounting-form', function () {
  setupRenderingTest();

  it('has class "space-support-accounting-form"', async function () {
    await renderComponent();

    expect(find('.space-support-accounting-form')).to.exist;
  });

  it('renders two toggles - accounting and dirs stats', async function () {
    await renderComponent();

    const accountingEnabledField = find('.accountingEnabled-field');
    const dirStatsServiceEnabledField = find('.dirStatsServiceEnabled-field');

    expect(accountingEnabledField).to.exist;
    expect(accountingEnabledField.querySelector('label'))
      .to.have.trimmed.text('Accounting:');
    expect(accountingEnabledField.querySelector('.one-way-toggle'))
      .to.exist;
    const accountingEnabledTip = await new OneTooltipHelper(
      accountingEnabledField.querySelector('.one-label-tip .one-icon')
    ).getText();
    expect(accountingEnabledTip.trim()).to.equal(
      'If enabled, statistics of quota usage over time will be collected for this space. Accounting relies on the directory statistics service and requires that they are enabled together.'
    );

    expect(dirStatsServiceEnabledField).to.exist;
    expect(dirStatsServiceEnabledField.querySelector('label'))
      .to.have.trimmed.text('Directory statistics:');
    expect(dirStatsServiceEnabledField.querySelector('.one-way-toggle'))
      .to.exist;
    const dirStatsServiceEnabledTip = await new OneTooltipHelper(
      dirStatsServiceEnabledField.querySelector('.one-label-tip .one-icon')
    ).getText();
    expect(dirStatsServiceEnabledTip.trim()).to.equal(
      'If enabled, directory statistics will be collected for each directory in this space. They include metrics with file count, logical/physical byte size and track their changes in time.'
    );
  });

  it('renders enabled fields when "isDisabled" is false', async function () {
    this.set('isDisabled', false);
    await renderComponent();

    expect(find('.field-disabled')).to.not.exist;
  });

  it('renders disabled fields when "isDisabled" is true', async function () {
    this.set('isDisabled', true);
    await renderComponent();

    expect(find('.field-enabled')).to.not.exist;
  });

  context('in "view" mode', function () {
    beforeEach(function () {
      this.set('mode', 'view');
    });

    it('renders fields in view mode', async function (done) {
      await renderComponent();

      expect(find('.accounting-fields-root-group'))
        .to.have.class('field-view-mode');
      done();
    });

    it('shows values injected into component and changes them reactively',
      async function (done) {
        this.set('values', {
          accountingEnabled: true,
          dirStatsServiceEnabled: true,
        });

        await renderComponent();
        const accountingEnabledToggle =
          find('.accountingEnabled-field .one-way-toggle');
        const dirStatsServiceEnabledToggle =
          find('.dirStatsServiceEnabled-field .one-way-toggle');

        expect(accountingEnabledToggle).to.have.class('checked');
        expect(dirStatsServiceEnabledToggle).to.have.class('checked');

        this.set('values', {
          accountingEnabled: false,
          dirStatsServiceEnabled: true,
        });
        await settled();

        expect(accountingEnabledToggle).to.not.have.class('checked');
        expect(dirStatsServiceEnabledToggle).to.have.class('checked');

        this.set('values', {
          accountingEnabled: false,
          dirStatsServiceEnabled: false,
        });
        await settled();

        expect(accountingEnabledToggle).to.not.have.class('checked');
        expect(dirStatsServiceEnabledToggle).to.not.have.class('checked');

        done();
      });

    it('shows status badge', async function (done) {
      this.set('dirStatsServiceStatus', 'initializing');

      await renderComponent();

      expect(find('.status-badge.status-initializing')).to.exist;
      done();
    });
  });

  context('in "edit" mode', function () {
    beforeEach(function () {
      this.setProperties({
        mode: 'edit',
        changeSpy: sinon.spy(),
      });
    });

    it('renders fields in edit mode', async function (done) {
      await renderComponent();

      expect(find('.accounting-fields-root-group'))
        .to.have.class('field-edit-mode');
      done();
    });

    it('shows values injected into component and does not change them reactively',
      async function (done) {
        this.set('values', {
          accountingEnabled: true,
          dirStatsServiceEnabled: true,
        });

        await renderComponent();
        const accountingEnabledToggle =
          find('.accountingEnabled-field .one-way-toggle');
        const dirStatsServiceEnabledToggle =
          find('.dirStatsServiceEnabled-field .one-way-toggle');

        expect(accountingEnabledToggle).to.have.class('checked');
        expect(dirStatsServiceEnabledToggle).to.have.class('checked');

        this.set('values', {
          accountingEnabled: false,
          dirStatsServiceEnabled: true,
        });
        await settled();

        expect(accountingEnabledToggle).to.have.class('checked');
        expect(dirStatsServiceEnabledToggle).to.have.class('checked');

        done();
      });

    it('allows changing of accounting toggle', async function (done) {
      const changeSpy = this.get('changeSpy');
      this.set('values', {
        accountingEnabled: false,
        dirStatsServiceEnabled: false,
      });

      await renderComponent();
      const accountingEnabledToggle =
        find('.accountingEnabled-field .one-way-toggle');
      changeSpy.resetHistory();

      await click(accountingEnabledToggle);
      expect(changeSpy).to.be.calledOnce.and.to.be.calledWith({
        accountingEnabled: true,
        dirStatsServiceEnabled: true,
      });
      changeSpy.resetHistory();

      await click(accountingEnabledToggle);
      expect(changeSpy).to.be.calledOnce.and.to.be.calledWith({
        accountingEnabled: false,
        dirStatsServiceEnabled: true,
      });

      done();
    });

    it('allows changing of dir stats toggle when accounting is disabled',
      async function (done) {
        const changeSpy = this.get('changeSpy');
        this.set('values', {
          accountingEnabled: false,
          dirStatsServiceEnabled: false,
        });

        await renderComponent();
        const dirStatsServiceEnabledToggle =
          find('.dirStatsServiceEnabled-field .one-way-toggle');
        changeSpy.resetHistory();

        await click(dirStatsServiceEnabledToggle);
        expect(changeSpy).to.be.calledOnce.and.to.be.calledWith({
          accountingEnabled: false,
          dirStatsServiceEnabled: true,
        });
        changeSpy.resetHistory();

        await click(dirStatsServiceEnabledToggle);
        expect(changeSpy).to.be.calledOnce.and.to.be.calledWith({
          accountingEnabled: false,
          dirStatsServiceEnabled: false,
        });

        done();
      });

    it('disallows changing of dir stats toggle when accounting is enabled',
      async function (done) {
        this.set('values', {
          accountingEnabled: true,
          dirStatsServiceEnabled: true,
        });

        await renderComponent();

        expect(find('.dirStatsServiceEnabled-field'))
          .to.have.class('field-disabled');

        done();
      });

    it('does not show status badge', async function (done) {
      this.set('dirStatsServiceStatus', 'initializing');

      await renderComponent();

      expect(find('.status-badge')).to.not.exist;
      done();
    });
  });
});

async function renderComponent() {
  await render(hbs`{{space-support-accounting-form
    isDisabled=isDisabled
    mode=mode
    values=values
    onChange=changeSpy
    dirStatsServiceStatus=dirStatsServiceStatus
  }}`);
}
