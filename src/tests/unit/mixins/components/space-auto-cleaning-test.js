import { expect } from 'chai';
import { describe, it } from 'mocha';
import Ember from 'ember';
import ComponentsSpaceAutoCleaningMixin from 'onepanel-gui/mixins/components/space-auto-cleaning';

describe('Unit | Mixin | components/space auto cleaning', function() {
  // Replace this with your real tests.
  it('works', function() {
    let ComponentsSpaceAutoCleaningObject = Ember.Object.extend(ComponentsSpaceAutoCleaningMixin);
    let subject = ComponentsSpaceAutoCleaningObject.create();
    expect(subject).to.be.ok;
  });
});
