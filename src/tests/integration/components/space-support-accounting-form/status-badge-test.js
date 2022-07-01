import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import _ from 'lodash';
import { find } from 'ember-native-dom-helpers';

describe('Integration | Component | space support accounting form/status badge', function () {
  setupComponentTest('space-support-accounting-form/status-badge', {
    integration: true,
  });

  beforeEach(function () {
    this.set('field', {
      dirStatsCollectingStatus: null,
    });
  });

  [
    'initializing',
    'stopping',
  ].forEach((status) => {
    it(`shows badge when status is ${JSON.stringify(status)}`, async function () {
      this.set('field.dirStatsCollectingStatus', status);
      await renderComponent(this);

      const badge = find('.status-badge');
      expect(badge).to.exist;
      expect(badge.textContent.trim()).to.equal(_.upperFirst(status) + '...');
    });
  });

  [
    'enabled',
    'disabled',
    null,
  ].forEach((status) => {
    it(`does not show badge when status is ${JSON.stringify(status)}`, async function () {
      this.set('field.dirStatsCollectingStatus', status);
      await renderComponent(this);

      const badge = find('.status-badge');
      expect(badge).to.not.exist;
    });
  });
});

async function renderComponent(testCase) {
  testCase.render(hbs`{{space-support-accounting-form/status-badge field=field}}`);
}
