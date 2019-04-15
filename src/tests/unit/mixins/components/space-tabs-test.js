import EmberObject from '@ember/object';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import ComponentsComponentsSpaceTabsMixin from 'onepanel-gui/mixins/components/space-tabs';
import sinon from 'sinon';

describe('Unit | Mixin | components/space tabs', function () {
  it('has tabPopular always enabled', function () {
    const changeTabUrl = sinon.stub().resolves();
    const ComponentsComponentsSpaceTabsObject =
      EmberObject.extend(ComponentsComponentsSpaceTabsMixin, {
        changeTabUrl,
      });
    const subject = ComponentsComponentsSpaceTabsObject.create();

    expect(subject.get('tabPopularClass')).to.equal('enabled');
  });

  it('enables tabClean', function () {
    const changeTabUrl = sinon.stub().resolves();
    const ComponentsComponentsSpaceTabsObject =
      EmberObject.extend(ComponentsComponentsSpaceTabsMixin, {
        changeTabUrl,
      });
    const subject = ComponentsComponentsSpaceTabsObject.create();

    expect(subject.get('tabCleanClass'), 'before change').to.equal('disabled');

    subject.set('filePopularityConfiguration', {
      enabled: true,
    });

    expect(subject.get('tabCleanClass'), 'after change').to.equal('enabled');
  });

  it('disables tabClean', function () {
    const changeTabUrl = sinon.stub().resolves();
    const ComponentsComponentsSpaceTabsObject =
      EmberObject.extend(ComponentsComponentsSpaceTabsMixin, {
        changeTabUrl,
      });
    const subject = ComponentsComponentsSpaceTabsObject.create({
      filePopularityConfiguration: {
        enabled: true,
      },
    });

    expect(subject.get('tabCleanClass'), 'before change').to.equal('enabled');

    subject.set('filePopularityConfiguration', {
      enabled: false,
    });

    expect(subject.get('tabCleanClass'), 'after change').to.equal('disabled');
  });
});
