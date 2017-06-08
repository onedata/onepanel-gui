import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | status icon', function () {
  setupComponentTest('status-icon', {
    integration: true
  });

  // FIXME test changing status - classes  
  it('renders', function () {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    // Template block usage:
    // this.render(hbs`
    //   {{#status-icon}}
    //     template content
    //   {{/status-icon}}
    // `);

    this.render(hbs `{{status-icon}}`);
    expect(this.$()).to.have.length(1);
  });
});
