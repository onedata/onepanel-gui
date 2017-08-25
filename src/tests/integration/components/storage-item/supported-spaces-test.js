import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import ProviderManagerStub from '../../../helpers/provider-manager-stub';
import SpaceDetails from 'onepanel-gui/models/space-details';

import Ember from 'ember';
const {
  RSVP: { Promise },
} = Ember;

import bytesToString from 'onedata-gui-common/utils/bytes-to-string';
const b2s = (bytes) => bytesToString(bytes, { iecFormat: true });

const PromiseObject = Ember.ObjectProxy.extend(Ember.PromiseProxyMixin);

describe('Integration | Component | storage item/supported spaces', function () {
  setupComponentTest('storage-item/supported-spaces', {
    integration: true,
  });

  beforeEach(function () {
    this.register('service:provider-manager', ProviderManagerStub);
    this.inject.service('provider-manager', { as: 'providerManager' });
  });

  it('shows total support size', function (done) {
    let providerManager = this.container.lookup('service:providerManager');
    let providerId = providerManager.get('__providerDetails.id');

    let storageId = 'storage1';

    this.set('storageId', storageId);

    this.set('storages', [{
      id: 'storage1',
      type: 'posix',
    }]);

    this.set('spaces', [
      PromiseObject.create({
        promise: Promise.resolve(
          SpaceDetails.create({
            id: 'space1',
            name: 'Space One',
            storageId,
            supportingProviders: {
              [providerId]: 100000,
            },
          })),
      }),
      PromiseObject.create({
        promise: Promise.resolve(
          SpaceDetails.create({
            id: 'space2',
            name: 'Space Two',
            storageId,
            supportingProviders: {
              [providerId]: 300000,
            },
          })),
      }),
    ]);

    let totalSupport = 400000;

    this.render(hbs `
    {{storage-item/supported-spaces spaces=spaces storageId=storageId}}
    `);

    wait().then(() => {
      let header = this.$('.supported-spaces-header');

      expect(header.html()).to.match(
        new RegExp(b2s(totalSupport).replace('.', '\\.'))
      );

      done();
    });
  });

});
