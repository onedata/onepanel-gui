import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | space sync stats', function() {
  setupComponentTest('space-sync-stats', {
    integration: true
  });

  it('renders', function() {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    // Template block usage:
    // this.render(hbs`
    //   {{#space-sync-stats}}
    //     template content
    //   {{/space-sync-stats}}
    // `);

    this.render(hbs`{{space-sync-stats}}`);
    expect(this.$()).to.have.length(1);
  });
});
