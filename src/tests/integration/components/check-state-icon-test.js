import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | check state icon', function () {
  setupRenderingTest();

  it('renders with success class and icon when success is true', async function() {
    await render(hbs `{{check-state-icon success=true}}`);
    const $checkStateIcon = this.$('.check-state-icon');
    expect($checkStateIcon).to.exist;
    expect($checkStateIcon).to.have.class('success');
    expect($checkStateIcon).to.have.class('oneicon-checkbox-filled');
  });

  it('renders with warning class and icon when success is false', async function() {
    await render(hbs `{{check-state-icon success=false}}`);
    const $checkStateIcon = this.$('.check-state-icon');
    expect($checkStateIcon).to.exist;
    expect($checkStateIcon).to.have.class('warning');
    expect($checkStateIcon).to.have.class('oneicon-checkbox-filled-x');
  });
});
