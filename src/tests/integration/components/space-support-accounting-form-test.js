import { expect } from 'chai';
import { describe, context, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { find, click } from 'ember-native-dom-helpers';
import wait from 'ember-test-helpers/wait';
import sinon from 'sinon';
import OneTooltipHelper from '../../helpers/one-tooltip';

describe('Integration | Component | space support accounting form', function () {
  setupComponentTest('space-support-accounting-form', {
    integration: true,
  });

  it('has class "space-support-accounting-form"', async function () {
    await renderComponent(this);

    expect(find('.space-support-accounting-form')).to.exist;
  });

  it('renders two toggles - accounting and dirs stats', async function () {
    await renderComponent(this);

    const accountingEnabledField = find('.accountingEnabled-field');
    const dirStatsServiceEnabledField = find('.dirStatsServiceEnabled-field');

    expect(accountingEnabledField).to.exist;
    expect(accountingEnabledField.querySelector('label').textContent.trim())
      .to.equal('Accounting:');
    expect(accountingEnabledField.querySelector('.one-way-toggle'))
      .to.exist;
    const accountingEnabledTip = await new OneTooltipHelper(
      accountingEnabledField.querySelector('.one-label-tip .one-icon')
    ).getText();
    expect(accountingEnabledTip.trim()).to.equal(
      'If enabled, space usage statistics will be collected to provide information about it\'s current and historical load. In order to work properly it enforces directory size statistics collecting.'
    );

    expect(dirStatsServiceEnabledField).to.exist;
    expect(dirStatsServiceEnabledField.querySelector('label').textContent.trim())
      .to.equal('Directory size statistics:');
    expect(dirStatsServiceEnabledField.querySelector('.one-way-toggle'))
      .to.exist;
    const dirStatsServiceEnabledTip = await new OneTooltipHelper(
      dirStatsServiceEnabledField.querySelector('.one-label-tip .one-icon')
    ).getText();
    expect(dirStatsServiceEnabledTip.trim()).to.equal(
      'If enabled, directory size statistics will be collected for each directory in this space. They include metrics with file count, logical byte size and physical byte size and track their changes in time.'
    );
  });

  it('renders enabled fields when "isDisabled" is false', async function () {
    this.set('isDisabled', false);
    await renderComponent(this);

    expect(find('.field-disabled')).to.not.exist;
  });

  it('renders disabled fields when "isDisabled" is true', async function () {
    this.set('isDisabled', true);
    await renderComponent(this);

    expect(find('.field-enabled')).to.not.exist;
  });

  context('in "view" mode', function () {
    beforeEach(function () {
      this.set('mode', 'view');
    });

    it('renders fields in view mode', async function (done) {
      await renderComponent(this);

      expect(find('.accounting-fields-root-group').matches('.field-view-mode'))
        .to.be.true;
      done();
    });

    it('shows values injected into component and changes them reactively',
      async function (done) {
        this.set('values', {
          accountingEnabled: true,
          dirStatsServiceEnabled: true,
        });

        await renderComponent(this);
        const accountingEnabledToggle =
          find('.accountingEnabled-field .one-way-toggle');
        const dirStatsServiceEnabledToggle =
          find('.dirStatsServiceEnabled-field .one-way-toggle');

        expect(accountingEnabledToggle.matches('.checked')).to.be.true;
        expect(dirStatsServiceEnabledToggle.matches('.checked')).to.be.true;

        this.set('values', {
          accountingEnabled: false,
          dirStatsServiceEnabled: true,
        });
        await wait();

        expect(accountingEnabledToggle.matches('.checked')).to.be.false;
        expect(dirStatsServiceEnabledToggle.matches('.checked')).to.be.true;

        this.set('values', {
          accountingEnabled: false,
          dirStatsServiceEnabled: false,
        });
        await wait();

        expect(accountingEnabledToggle.matches('.checked')).to.be.false;
        expect(dirStatsServiceEnabledToggle.matches('.checked')).to.be.false;

        done();
      });

    it('shows status badge', async function (done) {
      this.set('dirStatsServiceStatus', 'initializing');

      await renderComponent(this);

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
      await renderComponent(this);

      expect(find('.accounting-fields-root-group').matches('.field-edit-mode'))
        .to.be.true;
      done();
    });

    it('shows values injected into component and does not change them reactively',
      async function (done) {
        this.set('values', {
          accountingEnabled: true,
          dirStatsServiceEnabled: true,
        });

        await renderComponent(this);
        const accountingEnabledToggle =
          find('.accountingEnabled-field .one-way-toggle');
        const dirStatsServiceEnabledToggle =
          find('.dirStatsServiceEnabled-field .one-way-toggle');

        expect(accountingEnabledToggle.matches('.checked')).to.be.true;
        expect(dirStatsServiceEnabledToggle.matches('.checked')).to.be.true;

        this.set('values', {
          accountingEnabled: false,
          dirStatsServiceEnabled: true,
        });
        await wait();

        expect(accountingEnabledToggle.matches('.checked')).to.be.true;
        expect(dirStatsServiceEnabledToggle.matches('.checked')).to.be.true;

        done();
      });

    it('allows changing of accounting toggle', async function (done) {
      const changeSpy = this.get('changeSpy');
      this.set('values', {
        accountingEnabled: false,
        dirStatsServiceEnabled: false,
      });

      await renderComponent(this);
      const accountingEnabledToggle =
        find('.accountingEnabled-field .one-way-toggle');
      changeSpy.reset();

      await click(accountingEnabledToggle);
      expect(changeSpy).to.be.calledOnce.and.to.be.calledWith({
        accountingEnabled: true,
        dirStatsServiceEnabled: true,
      });
      changeSpy.reset();

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

        await renderComponent(this);
        const dirStatsServiceEnabledToggle =
          find('.dirStatsServiceEnabled-field .one-way-toggle');
        changeSpy.reset();

        await click(dirStatsServiceEnabledToggle);
        expect(changeSpy).to.be.calledOnce.and.to.be.calledWith({
          accountingEnabled: false,
          dirStatsServiceEnabled: true,
        });
        changeSpy.reset();

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

        await renderComponent(this);

        expect(find('.dirStatsServiceEnabled-field').matches('.field-disabled'))
          .to.be.true;

        done();
      });

    it('does not show status badge', async function (done) {
      this.set('dirStatsServiceStatus', 'initializing');

      await renderComponent(this);

      expect(find('.status-badge')).to.not.exist;
      done();
    });
  });
});

async function renderComponent(testCase) {
  testCase.render(hbs`{{space-support-accounting-form
    isDisabled=isDisabled
    mode=mode
    values=values
    onChange=changeSpy
    dirStatsServiceStatus=dirStatsServiceStatus
  }}`);
  await wait();
}
