import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | content clusters overview', function() {
  setupComponentTest('content-clusters-overview', {
    integration: true
  });

  it('renders', function() {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    // Template block usage:
    // this.render(hbs`
    //   {{#content-clusters-overview}}
    //     template content
    //   {{/content-clusters-overview}}
    // `);

    this.render(hbs`{{content-clusters-overview}}`);
    expect(this.$()).to.have.length(1);
  });
});
