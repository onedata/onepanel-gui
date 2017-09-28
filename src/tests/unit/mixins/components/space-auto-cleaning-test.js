import { expect } from 'chai';
import { describe, it } from 'mocha';
import Ember from 'ember';
import ComponentsSpaceAutoCleaningMixin from 'onepanel-gui/mixins/components/space-auto-cleaning';

import wait from 'ember-test-helpers/wait';

import sinon from 'sinon';

describe('Unit | Mixin | components/space auto cleaning', function () {
  it('fetches autoCleaning data if filesPopularity becomes enabled', function (done) {
    const spaceId = 'space_id';
    const autoCleaning = {};

    const spaceManager = {
      getAutoCleaning() {},
    };

    const ComponentsSpaceAutoCleaningObject =
      Ember.Object.extend(ComponentsSpaceAutoCleaningMixin, {
        spaceManager,
      });

    const getFilesPopularity = sinon.stub(spaceManager, 'getAutoCleaning');
    getFilesPopularity.withArgs(spaceId).resolves(autoCleaning);

    const subject = ComponentsSpaceAutoCleaningObject.create({
      space: {
        id: spaceId,
      },
      filesPopularity: {
        enabled: false,
      },
    });

    wait().then(() => {
      expect(subject.get('autoCleaning')).to.be.undefined;
      subject.set('filesPopularity.enabled', true);
      expect(subject.get('autoCleaningLoading')).to.be.true;
      wait().then(() => {
        expect(subject.get('autoCleaning')).to.equal(autoCleaning);
        expect(subject.get('autoCleaningLoading')).to.be.false;
        done();
      });
    });
  });

});
