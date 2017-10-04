import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | space files popularity', function () {
  setupComponentTest('space-files-popularity', {
    integration: true,
  });

  it('shows restUrl if files popularity is enabled', function () {
    const restUrl = 'abc';
    const filesPopularity = {
      enabled: true,
      restUrl,
    };
    this.set('filesPopularity', filesPopularity);
    this.render(hbs `{{space-files-popularity filesPopularity=filesPopularity}}`);
    expect(this.$('.files-popularity-rest-url')).to.have.value(restUrl);
  });

  it('does not render restUrl if files popularity is disabled', function () {
    const restUrl = 'abc';
    const filesPopularity = {
      enabled: false,
      restUrl,
    };
    this.set('filesPopularity', filesPopularity);
    this.render(hbs `{{space-files-popularity filesPopularity=filesPopularity}}`);
    expect(this.$('.files-popularity-rest-url')).to.not.exists;
  });
});
