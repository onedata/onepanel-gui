import { expect } from 'chai';
import { describe, it } from 'mocha';
import EmberObject from '@ember/object';
import ComponentsSpaceFilesPopularityMixin from 'onepanel-gui/mixins/components/space-files-popularity';

describe('Unit | Mixin | components/space files popularity', function () {
  it('reads one-way filesPopularity from space', function () {
    const filesPopularity = {};

    const ComponentsSpaceFilesPopularityObject =
      EmberObject.extend(ComponentsSpaceFilesPopularityMixin);
    const subject = ComponentsSpaceFilesPopularityObject.create({
      space: {
        filesPopularity,
      },
    });

    expect(subject.get('filesPopularity')).to.equal(filesPopularity);
  });
});
