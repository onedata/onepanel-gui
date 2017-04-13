import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | one form field static', function() {
  setupComponentTest('one-form-field-static', {
    integration: true
  });

  it('renders', function() {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    // Template block usage:
    // this.render(hbs`
    //   {{#one-form-field-static}}
    //     template content
    //   {{/one-form-field-static}}
    // `);

    this.render(hbs`{{one-form-field-static}}`);
    expect(this.$()).to.have.length(1);
  });
});
