import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { getProperties } from '@ember/object';

function approxEquals(value, targetValue) {
  const delta = 1;
  return value >= targetValue - delta && value <= targetValue + delta;
}

describe('Integration | Component | space cleaning bar chart', function () {
  setupComponentTest('space-cleaning-bar-chart', {
    integration: true,
  });

  beforeEach(function () {
    this.setProperties({
      settings: {
        threshold: 8388608,
        target: 6291456,
      },
      status: {
        spaceOccupancy: 7340032,
        inProgress: true,
      },
      spaceSize: 10485760,
    });
  });

  it('renders pacman if cleaning is working', function () {
    this.render(hbs `
      <div style="width: 500px">
        {{space-cleaning-bar-chart
          settings=settings
          status=status
          spaceSize=spaceSize}}
      </div>
    `);
    expect(this.$('.pacman')).to.exist;
  });

  it('does not render pacman if cleaning is not working', function () {
    this.set('status.inProgress', false);
    this.render(hbs `
      <div style="width: 500px">
        {{space-cleaning-bar-chart
          settings=settings
          status=status
          spaceSize=spaceSize}}
      </div>
    `);
    expect(this.$('.pacman')).not.to.exist;
  });

  it('renders valid indicators', function () {
    this.render(hbs `
      <div style="width: 500px">
        {{space-cleaning-bar-chart
          settings=settings
          status=status
          spaceSize=spaceSize}}
      </div>
    `);
    const indicators = this.$('.indicators');
    expect(indicators.find('.total-space')).to.contain('10 MiB');
    expect(indicators.find('.used-space')).to.contain('7 MiB');
    expect(indicators.find('.free-space')).to.contain('3 MiB');
    expect(indicators.find('.to-release')).to.contain('1 MiB');
  });

  it('renders valid slider values', function () {
    this.render(hbs `
      <div style="width: 500px">
        {{space-cleaning-bar-chart
          settings=settings
          status=status
          spaceSize=spaceSize}}
      </div>
    `);
    expect(this.$('.soft-quota-editor')).to.contain('6 MiB');
    expect(this.$('.hard-quota-editor')).to.contain('8 MiB');
  });

  it('renders valid bars', function () {
    this.render(hbs `
      <div style="width: 500px">
        {{space-cleaning-bar-chart
          settings=settings
          status=status
          spaceSize=spaceSize}}
      </div>
    `);
    const {
      spaceSize,
      settings,
      status,
    } = this.getProperties('spaceSize', 'settings', 'status');
    const {
      threshold,
      target,
    } = getProperties(settings, 'threshold', 'target');
    const spaceOccupancy = status.spaceOccupancy;
    const barWidth = (name) => parseFloat(
      this.$(name).attr('style').match(/width:\s+(\d+)%;/)[1]
    );
    const usedBelowSoftQuota = target * 100 / spaceSize;
    const usedBelowHardQuota = (spaceOccupancy - target) * 100 / spaceSize;
    const notUsedBelowHardQuota = (threshold - spaceOccupancy) * 100 / spaceSize;
    const notUsedOverHardQuota = (spaceSize - Math.max(threshold, spaceOccupancy)) *
      100 / spaceSize;
    const used = spaceOccupancy * 100 / spaceSize;
    expect(approxEquals(barWidth('.used-below-soft-quota'), usedBelowSoftQuota))
      .to.be.true;
    expect(approxEquals(barWidth('.not-used-below-soft-quota'), 0)).to.be.true;
    expect(approxEquals(barWidth('.used-below-hard-quota'), usedBelowHardQuota))
      .to.be.true;
    expect(approxEquals(
      barWidth('.not-used-below-hard-quota'), notUsedBelowHardQuota)).to.be.true;
    expect(approxEquals(barWidth('.used-over-hard-quota'), 0)).to.be.true;
    expect(approxEquals(
      barWidth('.not-used-over-hard-quota'), notUsedOverHardQuota)).to.be.true;
    expect(approxEquals(barWidth('.chart-bar.used'), used)).to.be.true;
    expect(approxEquals(barWidth('.pacman-row .used-space'), used)).to.be.true;
  });
});
