import { expect } from 'chai';
import { describe, it } from 'mocha';
import Ember from 'ember';
import ComponentsSpaceFilesPopularityMixin from 'onepanel-gui/mixins/components/space-files-popularity';
import wait from 'ember-test-helpers/wait';

import sinon from 'sinon';

describe('Unit | Mixin | components/space files popularity', function () {
  it('fetches files popularity on init', function (done) {
    const spaceId = 'space_id';
    const filesPopularity = {};

    const spaceManager = {
      getFilesPopularity() {},
    };

    const ComponentsSpaceFilesPopularityObject =
      Ember.Object.extend(ComponentsSpaceFilesPopularityMixin, {
        spaceManager,
      });

    const getFilesPopularity = sinon.stub(spaceManager, 'getFilesPopularity');
    getFilesPopularity.withArgs(spaceId).resolves(filesPopularity);

    const subject = ComponentsSpaceFilesPopularityObject.create({
      space: {
        id: spaceId,
      },
    });

    expect(subject.get('filesPopularityLoading')).to.be.true;
    wait().then(() => {
      expect(subject.get('filesPopularity')).to.equal(filesPopularity);
      expect(subject.get('filesPopularityLoading')).to.be.false;
      done();
    });
  });
});
