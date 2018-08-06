import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | check state icon', function () {
  setupComponentTest('check-state-icon', {
    integration: true,
  });

  it('renders with success class and icon when success is true', function () {
    this.render(hbs `{{check-state-icon success=true}}`);
    const $checkStateIcon = this.$('.check-state-icon');
    expect($checkStateIcon).to.exist;
    expect($checkStateIcon).to.have.class('success');
    expect($checkStateIcon).to.have.class('oneicon-checkbox-filled');
  });

  it('renders with warning class and icon when success is false', function () {
    this.render(hbs `{{check-state-icon success=false}}`);
    const $checkStateIcon = this.$('.check-state-icon');
    expect($checkStateIcon).to.exist;
    expect($checkStateIcon).to.have.class('warning');
    expect($checkStateIcon).to.have.class('oneicon-checkbox-filled-x');
  });
});
