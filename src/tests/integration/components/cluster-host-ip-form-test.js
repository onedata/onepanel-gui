import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, fillIn } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

describe('Integration | Component | cluster-host-ip-form', function () {
  setupRenderingTest();

  it('invokes hostDataChanged action when host data changes', async function () {
    const spyHostDataChanged = sinon.spy();
    this.set('spyHostDataChanged', spyHostDataChanged);

    this.setProperties({
      hostsIps: Object.freeze({
        'Host One': '172.17.0.1',
      }),
      hostsInfo: Object.freeze([{
        hostname: 'Host One',
        clusterWorker: true,
      }]),
    });

    await render(hbs `{{cluster-host-ip-form
      hostsIps=hostsIps
      hostsInfo=hostsInfo
      hostDataChanged=(action spyHostDataChanged)
    }}`);

    await fillIn('input.input-host-ip', '172.18.0.2');
    expect(spyHostDataChanged).to.be.calledWith('Host One', '172.18.0.2');
  });

  it('invokes allValidChanged action when host data is invalid', async function () {
    const spyAllValidChanged = sinon.spy();
    this.set('spyAllValidChanged', spyAllValidChanged);

    this.setProperties({
      hostsIps: {
        'Host One': '172.17.0.1',
      },
      hostsInfo: Object.freeze([{
        hostname: 'Host One',
        clusterWorker: true,
      }]),
      hostDataChanged: (key, value) => {
        this.get('hostsIps')[key] = value;
      },
    });

    await render(hbs `{{cluster-host-ip-form
      hostsIps=hostsIps
      hostsInfo=hostsInfo
      hostDataChanged=(action hostDataChanged)
      allValidChanged=(action spyAllValidChanged)
    }}`);

    await fillIn('input.input-host-ip', 'wrong');
    expect(spyAllValidChanged).to.be.calledWith(false);
  });
});
