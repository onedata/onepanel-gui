import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | space status icons', function () {
  setupComponentTest('space-status-icons', {
    integration: true
  });

  // FIXME test visibility of status icons  
  it('renders', function () {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    // Template block usage:
    // this.render(hbs`
    //   {{#space-status-icons}}
    //     template content
    //   {{/space-status-icons}}
    // `);

    this.render(hbs `{{space-status-icons}}`);
    expect(this.$()).to.have.length(1);
  });
});
