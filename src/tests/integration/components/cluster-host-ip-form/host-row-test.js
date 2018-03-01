import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | cluster host ip form/host row', function () {
  setupComponentTest('cluster-host-ip-form/host-row', {
    integration: true,
  });

  it('renders static text if readonly flag is true', function () {
    this.render(hbs `{{cluster-host-ip-form/host-row
      readonly=true
      hostname="hostname.one"
      ip="172.17.0.1"
    }}`);

    expect(this.$('input')).to.not.exist;
    expect(this.$('.cluster-host-ip-form-row').text()).to.match(/.*172\.17\.0\.1.*/);
  });

  it('renders input if readonly flag is false', function () {
    this.render(hbs `{{cluster-host-ip-form/host-row
      readonly=false
      hostname="hostname.one"
      ip="172.17.0.1"
    }}`);

    const $input = this.$('input');

    expect($input).to.exist;
    expect($input.val()).to.equal('172.17.0.1');
  });
});
