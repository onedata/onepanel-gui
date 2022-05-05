import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';
import OnepanelServerStub from '../../helpers/onepanel-server-stub';
import sinon from 'sinon';
import Service from '@ember/service';
import { registerService, lookupService } from '../../helpers/stub-service';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import { resolve } from 'rsvp';
import { set } from '@ember/object';

const OnepanelServer = OnepanelServerStub.extend({
  requestValidData() {
    throw new Error('hello');
  },
});

const ProviderManager = Service.extend({
  getProviderDetailsProxy: notImplementedReject,
});

const GuiUtils = Service.extend({});

describe('Integration | Component | user account button', function () {
  setupRenderingTest();

  beforeEach(function () {
    registerService(this, 'onepanel-server', OnepanelServer);
    registerService(this, 'provider-manager', ProviderManager);
    registerService(this, 'gui-utils', GuiUtils);
  });

  it('renders username got from onepanel server', async function () {
    const onepanelServer = lookupService(this, 'onepanelServer');
    const providerManager = lookupService(this, 'providerManager');

    const someUsername = 'some_username';
    onepanelServer.set('username', someUsername);
    set(onepanelServer, 'guiContext', {
      clusterId: 'cluster_id',
    });
    sinon.stub(providerManager, 'getProviderDetailsProxy')
      .returns(PromiseObject.create({
        promise: resolve({}),
      }));

    await render(hbs `{{user-account-button}}`);
    expect(this.$().text()).to.match(new RegExp(someUsername));
  });
});
