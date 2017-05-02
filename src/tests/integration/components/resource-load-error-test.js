import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | resource load error', function () {
  setupComponentTest('resource-load-error', {
    integration: true
  });

  it('renders show details button if reason is provided', function () {
    this.render(hbs `{{resource-load-error reason="some reason"}}`);
    expect(this.$('.promise-error-show-details')).to.have.length(1);
  });

  it('does not renders show details button if reason is not provided', function () {
    this.render(hbs `{{resource-load-error}}`);
    expect(this.$('.promise-error-show-details')).to.have.length(0);
  });

  it('renders custom message if provided', function () {
    let message = 'some message';
    this.set('message', message);
    this.render(hbs `{{resource-load-error message=message}}`);
    expect(this.$().text()).to.match(new RegExp(message));
  });
});