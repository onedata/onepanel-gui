import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import ProviderManagerStub from '../../helpers/provider-manager-stub';
import I18nStub from '../../helpers/i18n-stub';
import SpaceDetails from 'onepanel-gui/models/space-details';

import Ember from 'ember';
const {
  RSVP: { Promise },
} = Ember;

import bytesToString from 'onedata-gui-common/utils/bytes-to-string';
const b2s = (bytes) => bytesToString(bytes, { iecFormat: true });

const PromiseObject = Ember.ObjectProxy.extend(Ember.PromiseProxyMixin);

describe('Integration | Component | storage item', function () {
  setupComponentTest('storage-item', {
    integration: true,
  });

  beforeEach(function () {
    this.register('service:provider-manager', ProviderManagerStub);
    this.inject.service('provider-manager', { as: 'providerManager' });
    this.register('service:i18n', I18nStub);
    this.inject.service('i18n', { as: 'i18n' });
  });

  it('renders storage name', function (done) {
    let name = 'Storage One';
    this.set('storages', [{
      id: 'storage1',
      name,
      type: 'posix',
    }]);

    this.render(hbs `
    {{#one-collapsible-list as |list|}}
      {{#each storages as |storage|}}
        {{#list.item as |listItem|}}
          {{storage-item listItem=listItem storage=storage}}
        {{/list.item}}
      {{/each}}
    {{/one-collapsible-list}}`);

    wait().then(() => {
      expect(this.$('.storage-name')).to.exist;
      expect(this.$('.storage-name')).to.contain(name);

      done();
    });
  });

  it('shows total support size', function (done) {
    let providerManager = this.container.lookup('service:providerManager');
    let providerId = providerManager.get('__providerDetails.id');
    let storageId = 'storage1';

    this.set('storages', [{
      id: storageId,
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
    {{#one-collapsible-list as |list|}}
      {{#each storages as |storage|}}
        {{#list.item as |listItem|}}
          {{storage-item listItem=listItem spaces=spaces storage=storage}}
        {{/list.item}}
      {{/each}}
    {{/one-collapsible-list}}
    `);

    wait().then(() => {
      let header = this.$('.support-size');
      expect(header).to.contain(b2s(totalSupport));
      done();
    });
  });
});
