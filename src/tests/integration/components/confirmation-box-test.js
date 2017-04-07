import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | confirmation box', function () {
  setupComponentTest('confirmation-box', {
    integration: true
  });

  it('renders with given content', function () {

    this.render(hbs `
    <div id="ember-bootstrap-wormhole"></div>
    <button id="show-confirmation-box">
      {{#confirmation-box}}
        some text
      {{/confirmation-box}}
    </button>
    `);
    this.$('#show-confirmation-box').click();
    wait().then(() => {
      expect(this.$('.confirmation-box')).to.have.length(1);
    });
  });
});
