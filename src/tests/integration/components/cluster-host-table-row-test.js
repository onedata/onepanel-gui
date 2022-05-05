import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { registerService, lookupService } from '../../helpers/stub-service';
import Service from '@ember/service';
import { set } from '@ember/object';
import { resolve } from 'rsvp';
import sinon from 'sinon';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';

const OnepanelServer = Service.extend({
  getNodeProxy() {
    return this.get('nodeProxy');
  },
  nodeProxy: undefined,
});

describe('Integration | Component | cluster host table row', function () {
  setupRenderingTest();

  beforeEach(function () {
    registerService(this, 'onepanel-server', OnepanelServer);
  });

  it('renders remove button as disabled if this is current host', async function () {
    const removeHost = sinon.stub().resolves();
    const hostname = 'example.com';
    const node = {
      hostname,
    };
    const host = {
      hostname,
    };
    const onepanelServer = lookupService(this, 'onepanel-server');
    set(
      onepanelServer,
      'nodeProxy',
      PromiseObject.create({ promise: resolve(node) })
    );
    this.set('removeHost', removeHost);
    this.set('host', host);
    await render(hbs `{{cluster-host-table-row
      removeHost=removeHost
      host=host
      isMobile=false
    }}`);

    expect(this.$('.btn-remove-node')).to.have.class('disabled');
  });

  it('renders remove button as enabled if this is not the current host', async function () {
    const removeHost = sinon.stub().resolves();
    const hostname1 = 'example1.com';
    const hostname2 = 'example2.com';
    const node = {
      hostname: hostname1,
    };
    const host = {
      hostname: hostname2,
    };
    const onepanelServer = lookupService(this, 'onepanel-server');
    set(
      onepanelServer,
      'nodeProxy',
      PromiseObject.create({ promise: resolve(node) })
    );
    this.set('removeHost', removeHost);
    this.set('host', host);
    await render(hbs `{{cluster-host-table-row
      removeHost=removeHost
      host=host
      isMobile=false
    }}`);

    expect(this.$('.btn-remove-node')).to.not.have.class('disabled');
    await click('.btn-remove-node');
    expect(removeHost).to.be.calledOnce;
  });
});
