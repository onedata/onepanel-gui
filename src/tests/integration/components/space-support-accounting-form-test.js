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
    const dirStatsEnabledField = find('.dirStatsEnabled-field');

    expect(accountingEnabledField).to.exist;
    expect(accountingEnabledField.querySelector('label').textContent.trim())
      .to.equal('Accounting enabled:');
    expect(accountingEnabledField.querySelector('.one-way-toggle'))
      .to.exist;
    const accountingEnabledTip = await new OneTooltipHelper(
      accountingEnabledField.querySelector('.one-label-tip .one-icon')
    ).getText();
    expect(accountingEnabledTip.trim()).to.equal('Accounting tip');

    expect(dirStatsEnabledField).to.exist;
    expect(dirStatsEnabledField.querySelector('label').textContent.trim())
      .to.equal('Gather directory statistics:');
    expect(dirStatsEnabledField.querySelector('.one-way-toggle'))
      .to.exist;
    const dirStatsEnabledTip = await new OneTooltipHelper(
      dirStatsEnabledField.querySelector('.one-label-tip .one-icon')
    ).getText();
    expect(dirStatsEnabledTip.trim()).to.equal('Dir stats tip');
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

    it('shows values injected into component and changes them reactively', async function (done) {
      this.set('values', {
        accountingEnabled: true,
        dirStatsEnabled: true,
      });

      await renderComponent(this);
      const accountingEnabledToggle = find('.accountingEnabled-field .one-way-toggle');
      const dirStatsEnabledToggle = find('.dirStatsEnabled-field .one-way-toggle');

      expect(accountingEnabledToggle.matches('.checked')).to.be.true;
      expect(dirStatsEnabledToggle.matches('.checked')).to.be.true;

      this.set('values', {
        accountingEnabled: false,
        dirStatsEnabled: true,
      });
      await wait();

      expect(accountingEnabledToggle.matches('.checked')).to.be.false;
      expect(dirStatsEnabledToggle.matches('.checked')).to.be.true;

      this.set('values', {
        accountingEnabled: false,
        dirStatsEnabled: false,
      });
      await wait();

      expect(accountingEnabledToggle.matches('.checked')).to.be.false;
      expect(dirStatsEnabledToggle.matches('.checked')).to.be.false;

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

    it('shows values injected into component and does not change them reactively', async function (done) {
      this.set('values', {
        accountingEnabled: true,
        dirStatsEnabled: true,
      });

      await renderComponent(this);
      const accountingEnabledToggle = find('.accountingEnabled-field .one-way-toggle');
      const dirStatsEnabledToggle = find('.dirStatsEnabled-field .one-way-toggle');

      expect(accountingEnabledToggle.matches('.checked')).to.be.true;
      expect(dirStatsEnabledToggle.matches('.checked')).to.be.true;

      this.set('values', {
        accountingEnabled: false,
        dirStatsEnabled: true,
      });
      await wait();

      done();
    });

    it('allows changing of accounting toggle', async function (done) {
      const changeSpy = this.get('changeSpy');
      this.set('values', {
        accountingEnabled: false,
        dirStatsEnabled: false,
      });

      await renderComponent(this);
      const accountingEnabledToggle = find('.accountingEnabled-field .one-way-toggle');
      changeSpy.reset();

      await click(accountingEnabledToggle);
      expect(changeSpy).to.be.calledOnce.and.to.be.calledWith({
        accountingEnabled: true,
        dirStatsEnabled: true,
      });
      changeSpy.reset();

      await click(accountingEnabledToggle);
      expect(changeSpy).to.be.calledOnce.and.to.be.calledWith({
        accountingEnabled: false,
        dirStatsEnabled: true,
      });

      done();
    });

    it('allows changing of dir stats toggle when accounting is disabled', async function (done) {
      const changeSpy = this.get('changeSpy');
      this.set('values', {
        accountingEnabled: false,
        dirStatsEnabled: false,
      });

      await renderComponent(this);
      const dirStatsEnabledToggle = find('.dirStatsEnabled-field .one-way-toggle');
      changeSpy.reset();

      await click(dirStatsEnabledToggle);
      expect(changeSpy).to.be.calledOnce.and.to.be.calledWith({
        accountingEnabled: false,
        dirStatsEnabled: true,
      });
      changeSpy.reset();

      await click(dirStatsEnabledToggle);
      expect(changeSpy).to.be.calledOnce.and.to.be.calledWith({
        accountingEnabled: false,
        dirStatsEnabled: false,
      });

      done();
    });

    it('disallows changing of dir stats toggle when accounting is enabled', async function (done) {
      this.set('values', {
        accountingEnabled: true,
        dirStatsEnabled: true,
      });

      await renderComponent(this);

      expect(find('.dirStatsEnabled-field').matches('.field-disabled')).to.be.true;

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
  }}`);
  await wait();
}
