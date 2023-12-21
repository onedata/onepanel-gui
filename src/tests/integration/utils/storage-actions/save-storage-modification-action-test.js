import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, settled, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import SaveStorageModificationAction from 'onepanel-gui/utils/storage-actions/save-storage-modification-action';
import { computed } from '@ember/object';
import {
  getModalHeader,
  getModalBody,
  getModalFooter,
} from '../../../helpers/modal';
import { registerService } from '../../../helpers/stub-service';
import Service from '@ember/service';
import { resolve, reject } from 'rsvp';
import sinon from 'sinon';
import { htmlSafe } from '@ember/string';
import { suppressRejections } from '../../../helpers/suppress-rejections';

const exampleStorage = {
  id: 'storage-id',
  type: 'posix',
  name: 'my-storage',
  mountPoint: '/',
};

const StorageManagerServiceMock = Service.extend({
  storageBeforeModification: exampleStorage,
  storageAfterModification: null,
  modifyStorageReturnValue: resolve({ verificationPassed: true }),
  isStorageModified: false,

  getStorageDetails() {
    return {
      content: this.isStorageModified ?
        this.storageAfterModification : this.storageBeforeModification,
    };
  },

  modifyStorage: computed(function () {
    return sinon.spy(() => {
      this.isStorageModified = true;
      return this.modifyStorageReturnValue;
    });
  }),
});

const GlobalNotifyServiceMock = Service.extend({
  warningAlert: sinon.spy(),
  success: sinon.spy(),
  backendError: sinon.spy(),
});

describe('Integration | Utility | storage-actions/save-storage-modification-action', function () {
  setupRenderingTest();

  beforeEach(function () {
    const storageId = 'storage-id';
    const modifiedStorageOptions = {};
    const action = SaveStorageModificationAction.create({
      ownerSource: this.owner,
      context: {
        storageId,
        modifiedStorageOptions,
      },
    });

    const storageManagerMock =
      registerService(this, 'storage-manager', StorageManagerServiceMock);
    const globalNotifyMock =
      registerService(this, 'global-notify', GlobalNotifyServiceMock);

    this.setProperties({
      storageId,
      modifiedStorageOptions,
      action,
      storageManagerMock,
      globalNotifyMock,
    });
  });

  it('has correct className', function () {
    expect(this.action.className).to.equal('save-storage-modification-action-trigger');
  });

  it('executes successfully without real persistence, when there is nothing to save',
    async function () {
      const { resultPromise } = await executeAction(this);
      const result = await resultPromise;

      expectResult(result, {
        storageBeforeModification: exampleStorage,
        storageAfterModification: exampleStorage,
        verificationPassed: true,
      });
      expect(this.storageManagerMock.modifyStorage).to.be.not.called;
      expect(this.globalNotifyMock.success)
        .to.be.calledWith(htmlSafe(
          'Storage backend "my-storage" has been modified successfully.'
        ));
    });

  it('executes successfully without additional modal, when changed options are non-critical',
    async function () {
      this.modifiedStorageOptions.name = 'my-storage2';
      this.storageManagerMock.storageAfterModification = {
        ...exampleStorage,
        ...this.modifiedStorageOptions,
      };

      const { resultPromise } = await executeAction(this);
      const result = await resultPromise;

      expectResult(result, {
        storageBeforeModification: exampleStorage,
        storageAfterModification: this.storageManagerMock.storageAfterModification,
        verificationPassed: true,
      });
      expect(this.storageManagerMock.modifyStorage)
        .to.be.calledWith(this.storageId, this.modifiedStorageOptions);
      expect(this.globalNotifyMock.success)
        .to.be.calledWith(htmlSafe(
          'Storage backend "my-storage" has been modified successfully.'
        ));
    });

  it('executes successfully with verification alert, when change didn\'t pass storage verification',
    async function () {
      this.modifiedStorageOptions.name = 'my-storage2';
      this.storageManagerMock.storageAfterModification = {
        ...exampleStorage,
        ...this.modifiedStorageOptions,
      };
      this.storageManagerMock.modifyStorageReturnValue =
        resolve({ verificationPassed: false });

      const { resultPromise } = await executeAction(this);
      const result = await resultPromise;

      expectResult(result, {
        storageBeforeModification: exampleStorage,
        storageAfterModification: this.storageManagerMock.storageAfterModification,
        verificationPassed: false,
      });
      expect(this.globalNotifyMock.success)
        .to.be.calledWith(htmlSafe(
          'Storage backend "my-storage" has been modified successfully.'
        ));
      expect(this.globalNotifyMock.warningAlert)
        .to.be.calledWith(htmlSafe(
          'File read/write test has failed after "my-storage" storage backend modification. Please make sure that the storage backend configuration is correct.'
        ));
    });

  it('executes successfully with ack modal, when changed options cause all possible issues',
    async function () {
      this.modifiedStorageOptions.qosParameters = { a: 1 };
      this.modifiedStorageOptions.mountPoint = '/sth';
      this.storageManagerMock.storageAfterModification = {
        ...exampleStorage,
        ...this.modifiedStorageOptions,
      };

      const { resultPromise } = await executeAction(this);

      expect(getModalHeader()).to.contain.text('Modify storage backend');
      expect(getModalBody()).to.contain.text(
        'Your modification can cause below issues and/or will need additional manual steps:'
      ).and.to.contain.text(
        'modification of QoS parameters will not trigger recalculation of the existing QoS requirements attached to your files. This will be improved in the next major release of Onedata,'
      ).and.to.contain.text(
        'this change will not take effect until Oneprovider and attached Oneclient instances are restarted.'
      ).and.to.contain.text(
        'Are you sure you want to modify storage backend details? Incorrect configuration can make your data unavailable.'
      );
      const buttons = getModalFooter().querySelectorAll('button');
      expect(buttons[0]).to.contain.text('Cancel');
      expect(buttons[1]).to.contain.text('Proceed');

      await click(buttons[1]);

      const result = await resultPromise;
      expectResult(result, {
        storageBeforeModification: exampleStorage,
        storageAfterModification: this.storageManagerMock.storageAfterModification,
        verificationPassed: true,
      });
    });

  it('executes successfully with ack modal, when changed options cause only qos issue',
    async function () {
      this.modifiedStorageOptions.qosParameters = { a: 1 };
      this.storageManagerMock.storageAfterModification = {
        ...exampleStorage,
        ...this.modifiedStorageOptions,
      };

      const { resultPromise } = await executeAction(this);

      expect(getModalBody()).to.contain.text(
        'modification of QoS parameters will not trigger recalculation of the existing QoS requirements attached to your files. This will be improved in the next major release of Onedata.'
      ).and.to.not.contain.text(
        'this change will not take effect until Oneprovider and attached Oneclient instances are restarted'
      );

      await click('.proceed');

      const result = await resultPromise;
      expectResult(result, {
        storageBeforeModification: exampleStorage,
        storageAfterModification: this.storageManagerMock.storageAfterModification,
        verificationPassed: true,
      });
    });

  it('executes successfully with ack modal, when changed options cause only restart issue',
    async function () {
      this.modifiedStorageOptions.mountPoint = '/sth';
      this.storageManagerMock.storageAfterModification = {
        ...exampleStorage,
        ...this.modifiedStorageOptions,
      };

      const { resultPromise } = await executeAction(this);

      expect(getModalBody()).to.contain.text(
        'this change will not take effect until Oneprovider and attached Oneclient instances are restarted.'
      ).and.to.not.contain.text(
        'modification of QoS parameters will not trigger recalculation of the existing QoS requirements attached to your files. This will be improved in the next major release of Onedata'
      );

      await click('.proceed');

      const result = await resultPromise;
      expectResult(result, {
        storageBeforeModification: exampleStorage,
        storageAfterModification: this.storageManagerMock.storageAfterModification,
        verificationPassed: true,
      });
    });

  it('can be cancelled via ack modal', async function () {
    this.modifiedStorageOptions.mountPoint = '/sth';
    this.storageManagerMock.storageAfterModification = {
      ...exampleStorage,
      ...this.modifiedStorageOptions,
    };

    const { resultPromise } = await executeAction(this);
    await click('.cancel');

    const result = await resultPromise;
    expect(result.status).to.equal('cancelled');
    expect(this.storageManagerMock.modifyStorage).to.be.not.called;
  });

  it('shows error, when execution fails', async function () {
    suppressRejections();
    this.storageManagerMock.modifyStorageReturnValue = reject('err');
    this.modifiedStorageOptions.name = 'my-storage2';

    const { resultPromise } = await executeAction(this);
    const result = await resultPromise;

    expect(result.status).to.equal('failed');
    expect(this.globalNotifyMock.backendError)
      .to.be.calledWith(htmlSafe('modifying storage backend'), 'err');
  });
});

function expectResult(result, {
  storageBeforeModification,
  storageAfterModification,
  verificationPassed,
}) {
  expect(result.result.storageBeforeModification).to.equal(storageBeforeModification);
  expect(result.result.storageAfterModification).to.equal(storageAfterModification);
  expect(result.result.verificationPassed).to.equal(verificationPassed);
}

async function executeAction(testCase) {
  await render(hbs `{{global-modal-mounter}}`);
  const resultPromise = testCase.get('action').execute();
  await settled();
  return { resultPromise };
}
