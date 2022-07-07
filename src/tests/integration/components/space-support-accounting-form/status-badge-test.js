import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import _ from 'lodash';
import { render, find } from '@ember/test-helpers';

describe('Integration | Component | space support accounting form/status badge', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.set('field', {
      dirStatsServiceStatus: null,
    });
  });

  [
    'initializing',
    'stopping',
  ].forEach((status) => {
    it(`shows badge when status is ${JSON.stringify(status)}`, async function () {
      this.set('field.dirStatsServiceStatus', status);
      await renderComponent();

      const badge = find('.status-badge');
      expect(badge).to.exist;
      expect(badge).to.have.trimmed.text(_.upperFirst(status) + '...');
    });
  });

  [
    'enabled',
    'disabled',
    null,
  ].forEach((status) => {
    it(`does not show badge when status is ${JSON.stringify(status)}`, async function () {
      this.set('field.dirStatsServiceStatus', status);
      await renderComponent();

      const badge = find('.status-badge');
      expect(badge).to.not.exist;
    });
  });
});

async function renderComponent() {
  await render(hbs`{{space-support-accounting-form/status-badge field=field}}`);
}
