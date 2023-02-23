import EmberObject, { set } from '@ember/object';
import { expect } from 'chai';
import {
  describe,
  it,
  beforeEach,
} from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, fillIn, find, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { resolve, reject } from 'rsvp';
import StorageManagerStub from '../../helpers/storage-manager-stub';
import SpaceManagerStub from '../../helpers/space-manager-stub';
import FormHelper from '../../helpers/form';
import { selectChoose, clickTrigger } from 'ember-power-select/test-support/helpers';
import { registerService, lookupService } from '../../helpers/stub-service';
import { suppressRejections } from '../../helpers/suppress-rejections';

const UNITS = {
  mib: Math.pow(1024, 2),
  gib: Math.pow(1024, 3),
  tib: Math.pow(1024, 4),
};

class SupportSpaceFormHelper extends FormHelper {
  constructor(template) {
    super(template, '.support-space-form');
  }
}

describe('Integration | Component | support-space-form', function () {
  setupRenderingTest();

  beforeEach(function () {
    registerService(this, 'storage-manager', StorageManagerStub);
    registerService(this, 'space-manager', SpaceManagerStub);
    const storageManager = lookupService(this, 'storage-manager');
    const spaceManager = lookupService(this, 'space-manager');

    this.prepareAllFields = function () {
      this.set('formValues', EmberObject.create({
        token: 'some_token',
        size: '100',
        sizeUnit: 'mib',
      }));
    };

    set(storageManager, '__storages', {
      storage1: {
        id: 'storage1',
        name: 'Storage1',
        importedStorage: false,
      },
      storage2: {
        id: 'storage2',
        name: 'Storage2',
        importedStorage: true,
      },
      storage3: {
        id: 'storage3',
        name: 'Storage3',
        importedStorage: true,
      },
    });

    set(spaceManager, '__spaces', [{
      id: 'space1',
      name: 'Space1',
      storageId: 'storage3',
    }, {
      id: 'space2',
      name: 'Space2',
      storageId: 'storage1',
    }]);
  });

  it(
    'does not disable storages with importedStorage equals false',
    async function () {
      await render(hbs `{{support-space-form}}`);

      await clickTrigger('.storage-field');
      const firstStorageItem = findAll('.ember-power-select-option')[0];

      expect(firstStorageItem.getAttribute('aria-disabled')).to.be.null;
      expect(firstStorageItem.querySelector('.imported-used-storage'))
        .to.be.null;
      expect(firstStorageItem.querySelector('.imported-storage')).to.be.null;
    }
  );

  it('does not disable storage without support and with importedStorage', async function () {
    await render(hbs `{{support-space-form}}`);

    await clickTrigger('.storage-field');

    const secondStorageItem = findAll('.ember-power-select-option')[1];
    expect(secondStorageItem.getAttribute('aria-disabled')).to.be.null;
    expect(secondStorageItem.querySelector('.imported-used-storage'))
      .to.be.null;
    expect(secondStorageItem.querySelector('.imported-storage').innerText)
      .to.equal('(import-enabled)');
  });

  it(
    'disables storages with support and importedStorage equals true',
    async function () {
      await render(hbs `{{support-space-form}}`);

      await clickTrigger('.storage-field');

      const thirdStorageItem = findAll('.ember-power-select-option')[2];
      expect(thirdStorageItem.getAttribute('aria-disabled')).to.equal('true');
      expect(thirdStorageItem.querySelector('.imported-used-storage').innerText)
        .to.equal('(import-enabled, already in use)');
    }
  );

  it('does not show import section if storage is not imported',
    async function () {
      await render(hbs `{{support-space-form}}`);

      expect(find('.storage-import-form')).to.have.class('collapse-hidden');
    }
  );

  it('renders import section if storage is imported', async function () {
    await render(hbs `{{support-space-form}}`);

    await selectStorageWithImport();
    expect(find('.storage-import-form')).to.not.have.class('collapse-hidden');
  });

  it('submits size multiplicated by chosen unit', async function () {
    const sizeToInput = 30;
    const unit = 'tib';
    const sizeOutput = sizeToInput * UNITS[unit];
    const submitStub = sinon.stub().resolves();
    this.set('submit', submitStub);
    this.prepareAllFields();

    await render(hbs `
      {{support-space-form
        submitSupportSpace=(action submit)
      }}
    `);

    const helper = new SupportSpaceFormHelper(this.element);
    await fillIn(helper.getInput('main-token'), 'some token');
    await fillIn(helper.getInput('main-size'), sizeToInput.toString());
    await click(helper.getInput('main-sizeUnit-' + unit));
    await helper.submit();

    expect(submitStub).to.be.calledOnce;
    expect(submitStub).to.be.calledWith(sinon.match.has('size', sizeOutput));
  });

  it('shows a global error notify when submit fails', async function () {
    suppressRejections();
    const globalNotify = lookupService(this, 'global-notify');
    const backendError = sinon.spy(globalNotify, 'backendError');
    this.prepareAllFields();

    this.set('submit', sinon.stub().returns(reject('some error')));

    await render(hbs `
      {{support-space-form
        submitSupportSpace=submit
        values=formValues
      }}
    `);

    await click('button[type=submit]');
    expect(backendError).to.be.calledOnce;
  });

  it('hides import form when selected storage is not imported', async function () {
    await render(hbs `{{support-space-form}}`);

    expect(
      find('.import-configuration-section').closest('.collapse-hidden')
    ).to.exist;
  });

  it('shows import form when selected storage is imported', async function () {
    await render(hbs `{{support-space-form}}`);

    await selectStorageWithImport();
    expect(
      find('.import-configuration-section').closest('.collapse-hidden')
    ).to.not.exist;
  });

  it('reacts to invalid data in import form', async function () {
    this.prepareAllFields();

    await render(hbs `{{support-space-form values=formValues}}`);

    await selectStorageWithImport();
    await fillIn('.field-generic-maxDepth', 'bad value');
    expect(find('button[type=submit]')).to.have.attr('disabled');
  });

  it('submits data from import form', async function () {
    const submitStub = sinon.stub().resolves();
    this.prepareAllFields();
    this.set('submit', submitStub);

    await render(hbs `
      {{support-space-form
        submitSupportSpace=(action submit)
        values=formValues
      }}
    `);

    await selectStorageWithImport();
    await click('.toggle-field-generic-continuousScan');
    await new SupportSpaceFormHelper(this.element).submit();

    expect(submitStub).to.be.calledOnce;
    expect(submitStub).to.be.calledWith(sinon.match.hasNested(
      'storageImport.autoStorageImportConfig.continuousScan',
      false
    ));
  });

  it('shows enabled and editable accounting section', async function () {
    await render(hbs`{{support-space-form}}`);

    expect(find('.space-support-accounting-form')).to.exist;
    const accountingRootGroup = find('.accounting-fields-root-group');
    expect(accountingRootGroup.matches('.field-edit-mode'))
      .to.be.true;
    expect(accountingRootGroup.querySelector('.field-disabled')).to.not.exist;
    expect(find('.accountingEnabled-field .one-way-toggle').matches('.checked'))
      .to.be.false;
    expect(find('.dirStatsServiceEnabled-field .one-way-toggle').matches('.checked'))
      .to.be.true;
  });

  it('submits default data from accounting form', async function () {
    const submitSpy = this.set('submitSpy', sinon.spy(() => resolve()));
    this.prepareAllFields();
    await render(hbs`{{support-space-form
      submitSupportSpace=submitSpy
      values=formValues
    }}`);

    await click('button[type="submit"]');

    expect(submitSpy).to.be.calledOnce;
    expect(submitSpy).to.be.calledWith(sinon.match({
      accountingEnabled: false,
      dirStatsServiceEnabled: true,
    }));
  });

  it('submits changed data from accounting form', async function () {
    const submitSpy = this.set('submitSpy', sinon.spy(() => resolve()));
    this.prepareAllFields();
    await render(hbs`{{support-space-form
      submitSupportSpace=submitSpy
      values=formValues
    }}`);

    await click('.accountingEnabled-field .one-way-toggle');
    await click('button[type="submit"]');

    expect(submitSpy).to.be.calledOnce;
    expect(submitSpy).to.be.calledWith(sinon.match({
      accountingEnabled: true,
      dirStatsServiceEnabled: true,
    }));
  });
});

async function selectStorageWithImport() {
  await selectChoose('.storage-field', 'Storage2');
}
