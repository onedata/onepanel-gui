import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import Ember from 'ember';
import ComponentsSpaceItemSupportsMixin from 'onepanel-gui/mixins/components/space-item-supports';
import ProviderManagerStub from '../../helpers/provider-manager-stub';

const {
  getOwner,
} = Ember;

describe('Integration | Mixin | components/space item supports', function () {
  setupTest('mixin:components/space-item-supports', {
    integration: true,
    subject() {
      let SpaceSupportsObject = Ember.Object.extend(
        ComponentsSpaceItemSupportsMixin
      );
      this.register('test-container:space-support-object', SpaceSupportsObject);
      return getOwner(this).lookup('test-container:space-support-object');
    },
  });

  beforeEach(function () {
    this.register('service:provider-manager', ProviderManagerStub);
    this.inject.service('provider-manager', { as: 'providerManager' });
  });

  it('converts supportingProviders object to spaceSupporters format', function (done) {
    let providerManager = getOwner(this).lookup('service:provider-manager');
    providerManager.set('__providerDetails.id', 'id1');
    providerManager.set('__providerDetails.name', 'My provider');

    let subject = this.subject();

    subject.set('space', {
      supportingProviders: {
        id1: 100,
        id2: 200,
        id3: 300,
      },
    });

    subject.get('spaceSupportersProxy.promise').then((result) => {
      expect(result).to.have.length(3);

      // NOTE: name is generated from id with special prefix

      expect(result[0]).to.have.property('name');
      expect(result[0].name).to.equal('My provider');
      expect(result[0]).to.have.property('size');
      expect(result[0].size).to.equal(100);

      expect(result[1]).to.have.property('name');
      expect(result[1].name).to.equal('Provider#id2');
      expect(result[1]).to.have.property('size');
      expect(result[1].size).to.equal(200);

      expect(result[2]).to.have.property('name');
      expect(result[2].name).to.equal('Provider#id3');
      expect(result[2]).to.have.property('size');
      expect(result[2].size).to.equal(300);

      done();
    });
  });
});
