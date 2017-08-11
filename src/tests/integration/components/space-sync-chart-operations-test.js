import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | space sync chart operations', function () {
  setupComponentTest('space-sync-chart-operations', {
    integration: true
  });

  it('renders', function () {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    // Template block usage:
    // this.render(hbs`
    //   {{#space-sync-chart-operations}}
    //     template content
    //   {{/space-sync-chart-operations}}
    // `);

    this.render(hbs `{{space-sync-chart-operations}}`);
    expect(this.$()).to.have.length(1);
  });
});
