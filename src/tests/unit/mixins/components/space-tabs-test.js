import { expect } from 'chai';
import { describe, it } from 'mocha';
import Ember from 'ember';
import ComponentsComponentsSpaceTabsMixin from 'onepanel-gui/mixins/components/space-tabs';

describe('Unit | Mixin | components/space tabs', function () {
  it('enables tabStorageSynchronization when sync in enabled', function () {
    const ComponentsComponentsSpaceTabsObject =
      Ember.Object.extend(ComponentsComponentsSpaceTabsMixin);
    const subject = ComponentsComponentsSpaceTabsObject.create({
      importEnabled: true,
    });

    const tab = subject.get('tabStorageSynchronization');

    expect(tab).to.be.true;
  });

  it('disables tabStorageSynchronization when sync in disabled', function () {
    const ComponentsComponentsSpaceTabsObject =
      Ember.Object.extend(ComponentsComponentsSpaceTabsMixin);
    const subject = ComponentsComponentsSpaceTabsObject.create({
      importEnabled: false,
    });

    const tab = subject.get('tabStorageSynchronization');

    expect(tab).to.be.false;
  });
});
