import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | space files popularity', function () {
  setupComponentTest('space-files-popularity', {
    integration: true,
  });

  it('turns on ', function () {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    // Template block usage:
    // this.render(hbs`
    //   {{#space-files-popularity}}
    //     template content
    //   {{/space-files-popularity}}
    // `);

    this.render(hbs `{{space-files-popularity}}`);
    expect(this.$()).to.have.length(1);
  });
});
