import { expect } from 'chai';
import { describe, it } from 'mocha';
import EmberObject from '@ember/object';
import ComponentsSpaceAutoCleaningMixin from 'onepanel-gui/mixins/components/space-auto-cleaning';

describe('Unit | Mixin | components/space auto cleaning', function () {
  it('reads one-way spaceCleaning from space', function () {
    const autoCleaning = {};

    const ComponentsSpaceAutoCleaningObject =
      EmberObject.extend(ComponentsSpaceAutoCleaningMixin);
    const subject = ComponentsSpaceAutoCleaningObject.create({
      space: {
        autoCleaning,
      },
    });

    expect(subject.get('autoCleaning')).to.equal(autoCleaning);
  });
});
