import EmberObject from '@ember/object';
import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';
import SpaceDetails from 'onepanel-gui/models/space-details';
import StorageManagerStub from '../../helpers/storage-manager-stub';
import ProviderManagerStub from '../../helpers/provider-manager-stub';
import sinon from 'sinon';
import { registerService, lookupService } from '../../helpers/stub-service';

const OnepanelServer = Service.extend({
  request() {},
});

describe('Integration | Component | cluster spaces table', function () {
  setupComponentTest('cluster-spaces-table', {
    integration: true,
  });

  beforeEach(function () {
    registerService(this, 'storage-manager', StorageManagerStub);
    registerService(this, 'provider-manager', ProviderManagerStub);
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
  });

  it('renders error message when at least one space details fetch was rejected',
    function () {
      let spaces = [
        EmberObject.create({
          isSettled: true,
          isRejected: false,
          isFulfilled: true,
          content: SpaceDetails.create({
            id: 'space-1',
            name: 'Space 1',
            storageId: 'storage-one',
          }),
        }),
        EmberObject.create({
          isSettled: true,
          isRejected: true,
          isFulfilled: false,
          reason: 'reason-one',
        }),
        EmberObject.create({
          isSettled: true,
          isRejected: true,
          isFulfilled: false,
          reason: 'reason-two',
        }),
      ];

      this.set('spaces', spaces);
      this.set('provider', { id: '123' });

      this.render(hbs `{{cluster-spaces-table spaces=spaces provider=provider}}`);
      expect(this.$('.alert-some-spaces-rejected')).to.exist;
    });

  it('does not render error message when all spaces are fetched successfully',
    function () {
      let spaces = [
        EmberObject.create({
          isSettled: true,
          isRejected: false,
          isFulfilled: true,
          content: SpaceDetails.create({
            id: 'space-1',
            name: 'Space 1',
          }),
        }),
        EmberObject.create({
          isSettled: true,
          isRejected: false,
          isFulfilled: true,
          content: SpaceDetails.create({
            id: 'space-2',
            name: 'Space 2',
          }),
        }),
      ];

      this.set('spaces', spaces);
      this.set('provider', { id: '123' });

      this.render(hbs `{{cluster-spaces-table spaces=spaces provider=provider}}`);
      expect(this.$('.alert-some-spaces-rejected')).to.not.exist;
    });
});
