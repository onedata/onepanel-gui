import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | cluster host ip form/host row', function () {
  setupRenderingTest();

  it('renders static text if readonly flag is true', async function () {
    await render(hbs `{{cluster-host-ip-form/host-row
      isReadOnly=true
      hostname="hostname.one"
      ip="172.17.0.1"
    }}`);

    expect(find('input')).to.not.exist;
    expect(find('.cluster-host-ip-form-row'))
      .to.contain.text('172.17.0.1');
  });

  it('renders input if readonly flag is false', async function () {
    await render(hbs `{{cluster-host-ip-form/host-row
      isReadOnly=false
      hostname="hostname.one"
      ip="172.17.0.1"
    }}`);

    const input = find('input');

    expect(input).to.exist;
    expect(input).to.have.value('172.17.0.1');
  });
});
