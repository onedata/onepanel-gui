import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | space-file-popularity', function () {
  setupRenderingTest();

  it('shows exampleQuery if file popularity is enabled', async function () {
    const exampleQuery = 'abc';
    const filePopularityConfiguration = {
      enabled: true,
      exampleQuery,
    };
    this.set('filePopularityConfiguration', filePopularityConfiguration);
    await render(hbs `
      {{space-file-popularity filePopularityConfiguration=filePopularityConfiguration}}
    `);
    expect(find('.file-popularity-example-query')).to.have.value(exampleQuery);
  });

  it('does not render exampleQuery if file popularity is disabled', async function () {
    const restUrl = 'abc';
    const filePopularityConfiguration = {
      enabled: false,
      restUrl,
    };
    this.set('filePopularityConfiguration', filePopularityConfiguration);
    await render(hbs `
      {{space-file-popularity filePopularityConfiguration=filePopularityConfiguration}}
    `);
    expect(find('.file-popularity-example-query')).to.not.exist;
  });
});
