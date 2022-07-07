import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { getProperties } from '@ember/object';

function approxEquals(value, targetValue) {
  const delta = 1;
  return value >= targetValue - delta && value <= targetValue + delta;
}

describe('Integration | Component | space cleaning bar chart', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.setProperties({
      settings: {
        threshold: 8388608,
        target: 6291456,
      },
      status: {
        spaceOccupancy: 7340032,
        lastRunStatus: 'active',
      },
      spaceSize: 10485760,
    });
  });

  it('renders pacman if cleaning is working', async function () {
    await render(hbs `
      <div style="width: 500px">
        {{space-cleaning-bar-chart
          settings=settings
          status=status
          spaceSize=spaceSize}}
      </div>
    `);
    expect(find('.pacman')).to.exist;
  });

  it('does not render pacman if cleaning is not working', async function () {
    this.set('status.lastRunStatus', 'completed');
    await render(hbs `
      <div style="width: 500px">
        {{space-cleaning-bar-chart
          settings=settings
          status=status
          spaceSize=spaceSize}}
      </div>
    `);
    expect(find('.pacman')).not.to.exist;
  });

  it('renders valid indicators', async function () {
    await render(hbs `
      <div style="width: 500px">
        {{space-cleaning-bar-chart
          settings=settings
          status=status
          spaceSize=spaceSize}}
      </div>
    `);
    const indicators = find('.indicators');
    expect(indicators.querySelector('.total-space')).to.contain.text('10 MiB');
    expect(indicators.querySelector('.used-space')).to.contain.text('7 MiB');
    expect(indicators.querySelector('.free-space')).to.contain.text('3 MiB');
    expect(indicators.querySelector('.to-release')).to.contain.text('1 MiB');
  });

  it('renders valid slider values', async function () {
    await render(hbs `
      <div style="width: 500px">
        {{space-cleaning-bar-chart
          settings=settings
          status=status
          spaceSize=spaceSize}}
      </div>
    `);
    expect(find('.soft-quota-editor')).to.contain.text('6 MiB');
    expect(find('.hard-quota-editor')).to.contain.text('8 MiB');
  });

  it('renders valid bars', async function () {
    await render(hbs `
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
      find(name).getAttribute('style').match(/width:\s+(\d+)%;/)[1]
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
