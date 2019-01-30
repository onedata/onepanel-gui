import EmberObject from '@ember/object';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import ComponentsComponentsSpaceTabsMixin from 'onepanel-gui/mixins/components/space-tabs';

describe('Unit | Mixin | components/space tabs', function () {
  it('enables tabSync', function () {
    const ComponentsComponentsSpaceTabsObject =
      EmberObject.extend(ComponentsComponentsSpaceTabsMixin);
    const subject = ComponentsComponentsSpaceTabsObject.create({
      space: {
        importEnabled: false,
      },
    });

    subject.set('space.importEnabled', true);

    expect(subject.get('tabSyncClass')).to.equal('enabled');
  });

  it('disables tabSync', function () {
    const ComponentsComponentsSpaceTabsObject =
      EmberObject.extend(ComponentsComponentsSpaceTabsMixin);
    const subject = ComponentsComponentsSpaceTabsObject.create({
      space: {
        importEnabled: true,
      },
    });

    expect(subject.get('tabSyncClass')).to.equal('enabled');

    subject.set('space.importEnabled', false);

    expect(subject.get('tabSyncClass')).to.equal('disabled');
  });

  it('has tabPopular always enabled', function () {
    const ComponentsComponentsSpaceTabsObject =
      EmberObject.extend(ComponentsComponentsSpaceTabsMixin);
    const subject = ComponentsComponentsSpaceTabsObject.create();

    expect(subject.get('tabPopularClass')).to.equal('enabled');
  });

  it('enables tabClean', function () {
    const ComponentsComponentsSpaceTabsObject =
      EmberObject.extend(ComponentsComponentsSpaceTabsMixin);
    const subject = ComponentsComponentsSpaceTabsObject.create();

    expect(subject.get('tabCleanClass'), 'before change').to.equal('disabled');

    subject.set('filesPopularityConfiguration', {
      enabled: true,
    });

    expect(subject.get('tabCleanClass'), 'after change').to.equal('enabled');
  });

  it('disables tabClean', function () {
    const ComponentsComponentsSpaceTabsObject =
      EmberObject.extend(ComponentsComponentsSpaceTabsMixin);
    const subject = ComponentsComponentsSpaceTabsObject.create({
      filesPopularityConfiguration: {
        enabled: true,
      },
    });

    expect(subject.get('tabCleanClass'), 'before change').to.equal('enabled');

    subject.set('filesPopularityConfiguration', {
      enabled: false,
    });

    expect(subject.get('tabCleanClass'), 'after change').to.equal('disabled');
  });
});
