import PromiseProxyMixin from '@ember/object/promise-proxy-mixin';
import ObjectProxy from '@ember/object/proxy';
import { Promise } from 'rsvp';
import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import ProviderManagerStub from '../../helpers/provider-manager-stub';
import I18nStub from '../../helpers/i18n-stub';
import SpaceDetails from 'onepanel-gui/models/space-details';
import { resolve } from 'rsvp';
import Service from '@ember/service';
import { registerService, lookupService } from '../../helpers/stub-service';

import bytesToString from 'onedata-gui-common/utils/bytes-to-string';
const b2s = (bytes) => bytesToString(bytes, { iecFormat: true });

const PromiseObject = ObjectProxy.extend(PromiseProxyMixin);

describe('Integration | Component | storage item', function () {
  setupComponentTest('storage-item', {
    integration: true,
  });

  beforeEach(function () {
    registerService(this, 'provider-manager', ProviderManagerStub);
    registerService(this, 'i18n', I18nStub);
    registerService(this, 'ceph-manager', Service);
  });

  it('renders storage name', function (done) {
    const name = 'Storage One';
    this.set('storages', [PromiseObject.create({
      promise: resolve({
        id: 'storage1',
        name,
        type: 'posix',
      }),
    })]);

    this.render(hbs `
    {{#one-collapsible-list as |list|}}
      {{#each storages as |storage|}}
        {{#list.item as |listItem|}}
          {{storage-item listItem=listItem storageProxy=storage}}
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
    const providerManager = lookupService(this, 'providerManager');
    const providerId = providerManager.get('__providerDetails.id');
    const storageId = 'storage1';

    this.set('storages', [PromiseObject.create({
      promise: resolve({
        id: storageId,
        type: 'posix',
      }),
    })]);

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

    const totalSupport = 400000;

    this.render(hbs `
    {{#one-collapsible-list as |list|}}
      {{#each storages as |storage|}}
        {{#list.item as |listItem|}}
          {{storage-item listItem=listItem spaces=spaces storageProxy=storage}}
        {{/list.item}}
      {{/each}}
    {{/one-collapsible-list}}
    `);

    wait().then(() => {
      const header = this.$('.support-size');
      expect(header).to.contain(b2s(totalSupport));
      done();
    });
  });
});
