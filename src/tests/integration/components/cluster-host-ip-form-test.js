import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';

describe('Integration | Component | cluster host ip form', function () {
  setupComponentTest('cluster-host-ip-form', {
    integration: true,
  });

  it('invokes hostDataChanged action when host data changes', function () {
    const spyHostDataChanged = sinon.spy();
    this.on('spyHostDataChanged', spyHostDataChanged);

    const hosts = Object.freeze({
      'Host One': '172.17.0.1',
    });
    this.set('hosts', hosts);

    this.render(hbs `{{cluster-host-ip-form
      hosts=hosts
      hostDataChanged=(action "spyHostDataChanged")
    }}`);

    const $form = this.$('.cluster-host-ip-form');
    const $input = $form.find('input.input-host-ip');

    $input.val('172.18.0.2')[0].dispatchEvent(new Event('input'));

    return wait().then(() => {
      expect(spyHostDataChanged).to.be.calledWith('Host One', '172.18.0.2');
    });
  });

  it('invokes allValidChanged action when host data is invalid', function () {
    const spyAllValidChanged = sinon.spy();
    this.on('spyAllValidChanged', spyAllValidChanged);

    const hosts = {
      'Host One': '172.17.0.1',
    };
    this.set('hosts', hosts);
    this.on('hostDataChanged', (key, value) => {
      hosts[key] = value;
    });

    this.render(hbs `{{cluster-host-ip-form
      hosts=hosts
      hostDataChanged=(action "hostDataChanged")
      allValidChanged=(action "spyAllValidChanged")
    }}`);

    const $form = this.$('.cluster-host-ip-form');
    const $input = $form.find('input.input-host-ip');

    $input.val('wrong')[0].dispatchEvent(new Event('input'));

    return wait().then(() => {
      expect(spyAllValidChanged).to.be.calledWith(false);
    });
  });
});