import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | storage import update form', function() {
  setupComponentTest('storage-import-update-form', {
    integration: true
  });

  it('renders', function() {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    // Template block usage:
    // this.render(hbs`
    //   {{#storage-import-update-form}}
    //     template content
    //   {{/storage-import-update-form}}
    // `);

    this.render(hbs`{{storage-import-update-form}}`);
    expect(this.$()).to.have.length(1);
  });
});
