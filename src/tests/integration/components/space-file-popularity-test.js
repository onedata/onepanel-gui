import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | space file popularity', function () {
  setupComponentTest('space-file-popularity', {
    integration: true,
  });

  it('shows exampleQuery if file popularity is enabled', function () {
    const exampleQuery = 'abc';
    const filePopularityConfiguration = {
      enabled: true,
      exampleQuery,
    };
    this.set('filePopularityConfiguration', filePopularityConfiguration);
    this.render(hbs `
      {{space-file-popularity filePopularityConfiguration=filePopularityConfiguration}}
    `);
    expect(this.$('.file-popularity-example-query')).to.have.value(exampleQuery);
  });

  it('does not render exampleQuery if file popularity is disabled', function () {
    const restUrl = 'abc';
    const filePopularityConfiguration = {
      enabled: false,
      restUrl,
    };
    this.set('filePopularityConfiguration', filePopularityConfiguration);
    this.render(hbs `
      {{space-file-popularity filePopularityConfiguration=filePopularityConfiguration}}
    `);
    expect(this.$('.file-popularity-example-query')).to.not.exists;
  });
});
