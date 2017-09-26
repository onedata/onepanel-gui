import { expect } from 'chai';
import { describe, it } from 'mocha';
import Ember from 'ember';
import ComponentsSpaceFilesPopularityMixin from 'onepanel-gui/mixins/components/space-files-popularity';

describe('Unit | Mixin | components/space files popularity', function() {
  // Replace this with your real tests.
  it('works', function() {
    let ComponentsSpaceFilesPopularityObject = Ember.Object.extend(ComponentsSpaceFilesPopularityMixin);
    let subject = ComponentsSpaceFilesPopularityObject.create();
    expect(subject).to.be.ok;
  });
});
