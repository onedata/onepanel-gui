import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';
import OnepanelServerStub from '../../helpers/onepanel-server-stub';
import sinon from 'sinon';
import Service from '@ember/service';
import { registerService, lookupService } from '../../helpers/stub-service';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import { resolve } from 'rsvp';
import wait from 'ember-test-helpers/wait';
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
  setupComponentTest('user-account-button', {
    integration: true,
  });

  beforeEach(function () {
    registerService(this, 'onepanel-server', OnepanelServer);
    registerService(this, 'provider-manager', ProviderManager);
    registerService(this, 'gui-utils', GuiUtils);
  });

  it('renders username got from onepanel server', function () {
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

    this.render(hbs `{{user-account-button}}`);
    return wait().then(() => {
      expect(this.$().text()).to.match(new RegExp(someUsername));
    });
  });
});
