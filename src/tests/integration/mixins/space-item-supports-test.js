import EmberObject from '@ember/object';
import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import ComponentsSpaceItemSupportsMixin from 'onepanel-gui/mixins/components/space-item-supports';
import ProviderManagerStub from '../../helpers/provider-manager-stub';
import { registerService, lookupService } from '../../helpers/stub-service';
import OwnerInjector from 'onedata-gui-common/mixins/owner-injector';
import sinon from 'sinon';

const SpaceSupportsObject = EmberObject.extend(
  ComponentsSpaceItemSupportsMixin,
  OwnerInjector
);

describe('Integration | Mixin | components/space item supports', function () {
  setupTest();

  beforeEach(function () {
    registerService(this, 'provider-manager', ProviderManagerStub);
  });

  it('converts supportingProviders object to spaceSupporters format', function (done) {
    const providerManager = lookupService(this, 'provider-manager');
    sinon.stub(providerManager, 'getRemoteProvider').rejects();
    sinon.stub(lookupService(this, 'i18n'), 't')
      .withArgs('supportInfo.provider')
      .returns('Provider');
    providerManager.set('__providerDetails.id', 'id1');
    providerManager.set('__providerDetails.name', 'My provider');

    const subject = SpaceSupportsObject.create({
      ownerSource: this.owner,
      space: {
        supportingProviders: {
          id1: 100,
          id2: 200,
          id3: 300,
        },
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
