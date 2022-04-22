import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | cluster host ip form/host row', function () {
  setupRenderingTest();

  it('renders static text if readonly flag is true', async function() {
    await render(hbs `{{cluster-host-ip-form/host-row
      isReadOnly=true
      hostname="hostname.one"
      ip="172.17.0.1"
    }}`);

    expect(this.$('input')).to.not.exist;
    expect(this.$('.cluster-host-ip-form-row').text())
      .to.match(/.*172\.17\.0\.1.*/);
  });

  it('renders input if readonly flag is false', async function() {
    await render(hbs `{{cluster-host-ip-form/host-row
      isReadOnly=false
      hostname="hostname.one"
      ip="172.17.0.1"
    }}`);

    const $input = this.$('input');

    expect($input).to.exist;
    expect($input.val()).to.equal('172.17.0.1');
  });
});
