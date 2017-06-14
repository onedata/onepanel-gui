import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | space support chart', function() {
  setupComponentTest('space-support-chart', {
    integration: true
  });

  it('renders', function() {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    // Template block usage:
    // this.render(hbs`
    //   {{#space-support-chart}}
    //     template content
    //   {{/space-support-chart}}
    // `);

    this.render(hbs`{{space-support-chart}}`);
    expect(this.$()).to.have.length(1);
  });
});
