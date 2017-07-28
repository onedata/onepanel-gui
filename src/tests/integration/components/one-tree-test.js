import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | one tree', function() {
  setupComponentTest('one-tree', {
    integration: true
  });

  it('renders', function() {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    // Template block usage:
    // this.render(hbs`
    //   {{#one-tree}}
    //     template content
    //   {{/one-tree}}
    // `);

    this.render(hbs`{{one-tree}}`);
    expect(this.$()).to.have.length(1);
  });
});
