import EmberObject from '@ember/object';
import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import SpaceDetails from 'onepanel-gui/models/space-details';
import StorageManagerStub from '../../helpers/storage-manager-stub';

import ProviderManagerStub from '../../helpers/provider-manager-stub';

describe('Integration | Component | cluster spaces table', function () {
  setupComponentTest('cluster-spaces-table', {
    integration: true,
  });

  beforeEach(function () {
    this.register('service:storage-manager', StorageManagerStub);
    this.inject.service('storage-manager', { as: 'storageManager' });

    this.register('service:provider-manager', ProviderManagerStub);
    this.inject.service('provider-manager', { as: 'providerManager' });
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

  it('does not render error message when at all spaces are fetched successfully',
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
