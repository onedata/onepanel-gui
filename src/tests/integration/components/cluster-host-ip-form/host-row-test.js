import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | cluster host ip form/host row', function () {
  setupComponentTest('cluster-host-ip-form/host-row', {
    integration: true,
  });

  it('renders input as readonly if readonly flag is true', function () {
    this.render(hbs `{{cluster-host-ip-form/host-row
      readonly=true
      hostname="hostname.one"
      ip="172.17.0.1"
    }}`);

    console.log(this.$('.cluster-host-ip-form-row input').parent().html());

    expect(this.$('.cluster-host-ip-form-row input')).to.have.attr('disabled');
  });
});
