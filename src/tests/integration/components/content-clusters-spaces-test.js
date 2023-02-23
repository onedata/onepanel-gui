import Service from '@ember/service';
import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import spaceManagerStub from '../../helpers/space-manager-stub';
import storageManagerStub from '../../helpers/storage-manager-stub';
import providerManagerStub from '../../helpers/provider-manager-stub';
import { registerService, lookupService } from '../../helpers/stub-service';
import sinon from 'sinon';

const OnepanelServer = Service.extend({
  request() {},
});

const SPACES = [{
    id: 'a1',
    name: 'Space A1',
    supportingProviders: [],
  },
  {
    id: 'b2',
    name: 'Space Conflicting',
    supportingProviders: [],
  },
  {
    id: 'c3',
    name: 'Space Conflicting',
    supportingProviders: [],
  },
];

const i18nStub = Service.extend({
  t() {
    return 'translation-mock';
  },
});

describe('Integration | Component | content-clusters-spaces', function () {
  setupRenderingTest();

  beforeEach(function () {
    registerService(this, 'space-manager', spaceManagerStub);
    registerService(this, 'i18n', i18nStub);
    registerService(this, 'storage-manager', storageManagerStub);
    registerService(this, 'provider-manager', providerManagerStub);
    registerService(this, 'onepanel-server', OnepanelServer);

    const onepanelServer = lookupService(this, 'onepanelServer');
    const requestStub = sinon.stub(onepanelServer, 'request');

    requestStub.rejects();

    requestStub.withArgs(
      'FilePopularityApi',
      'getFilePopularityConfiguration',
      sinon.match.any
    ).resolves({ data: {} });

    requestStub.withArgs(
      'AutoCleaningApi',
      'getSpaceAutoCleaningConfiguration',
      sinon.match.any
    ).resolves({ data: {} });

    const spaceManager = lookupService(this, 'space-manager');
    spaceManager.set('__spaces', SPACES);
  });

  it('shows support space form when clicking on support space button', async function () {
    await render(hbs `
      <button class="collapsible-toolbar-global-toggle"></button>
      {{content-clusters-spaces}}
    `);

    await click('button.btn-support-space');

    expect(find('.support-space-form')).to.exist;
  });
});
