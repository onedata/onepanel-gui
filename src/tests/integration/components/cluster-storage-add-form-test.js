import { expect } from 'chai';
import { describe, it, beforeEach, context } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, fillIn, settled, find, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import _ from 'lodash';
import { registerService } from '../../helpers/stub-service';
import Service from '@ember/service';
import { resolve } from 'rsvp';
import sinon from 'sinon';
import FormHelper from '../../helpers/form';
import GenericFields from 'onepanel-gui/utils/cluster-storage/generic-fields';
import PosixFields from 'onepanel-gui/utils/cluster-storage/posix-fields';
import LumaFields from 'onepanel-gui/utils/cluster-storage/luma-fields';
import { selectChoose } from 'ember-power-select/test-support/helpers';
import globals from 'onedata-gui-common/utils/globals';

const CephManager = Service.extend({
  getOsds() {
    return resolve([]);
  },

  suppressNotDeployed(promise) {
    return promise;
  },
});

class ClusterStorageAddHelper extends FormHelper {
  constructor(template) {
    super(template, '.cluster-storage-add-form');
  }
}

const POSIX_TYPE = {
  id: 'posix',
  name: 'POSIX',
};

const CEPH_RADOS_TYPE = {
  id: 'cephrados',
  name: 'Ceph RADOS',
};

const S3_TYPE = {
  id: 's3',
  name: 'S3',
};

const HTTP_TYPE = {
  id: 'http',
  name: 'HTTP',
};

const POSIX_STORAGE = {
  type: 'posix',
  id: 'storage1_verylongid',
  storagePathType: 'flat',
  importedStorage: true,
  mountPoint: '/mnt/st1',
  lumaFeed: 'external',
  lumaFeedUrl: 'http://some.url.com',
  lumaFeedApiKey: 'someapikey',
  rootUid: '1000',
  rootGid: '1001',
  timeout: 20,
  skipStorageDetection: true,
  readonly: true,
  name: 'Some POSIX storage',
};

const CEPH_RADOS_STORAGE = {
  type: 'cephrados',
  id: 'cephrados_id',
};

const HTTP_STORAGE = {
  name: 'Some Apache',
  verifyServerCertificate: false,
  type: 'http',
  storagePathType: 'canonical',
  skipStorageDetection: true,
  readonly: true,
  qosParameters: {
    storageId: 'e777476baf3418ed9861a97750be285ech9802',
    providerId: '94ba8a6cf8d6c598c856c4ee78d506f0ch487e',
  },
  lumaFeed: 'auto',
  importedStorage: true,
  id: 'e777476baf3418ed9861a97750be285ech9802',
  endpoint: 'http://172.17.0.3',
  credentialsType: 'none',
  maxRequestsPerSession: 3,
  connectionPoolSize: 150,
  authorizationHeader: 'Authorization: Bearer {}',
};

async function testNotAllowPathTypeEdit(storageData, storageType = storageData.type) {
  it(`does not allow to edit path type of storage with type "${storageType}"`, async function () {
    this.setProperties({
      storage: storageData,
      mode: 'edit',
    });
    await render(hbs `{{cluster-storage-add-form
      storage=storage
      mode=mode
      storageProvidesSupport=true
    }}`);

    const helper = new ClusterStorageAddHelper(this.element);

    const pathGroup = helper.getInput('generic_editor-storagePathType');
    expect(pathGroup).to.exist;
    const anyInput = pathGroup.querySelector('input');
    expect(anyInput, 'any input').to.not.exist;
    expect(pathGroup).to.have.trimmed.text(storageData.storagePathType);
  });
}

async function testAllowCertainPathTypeCreate({
  storageData,
  allow,
  pathType,
  storageType = storageData.type,
}) {
  const allowText = allow ? 'allows' : 'does not allow';
  it(`${allowText} to set "${pathType}" path type of storage with type "${storageType}"`, async function () {
    this.setProperties({
      storage: storageData,
      mode: 'create',
    });
    await render(hbs `{{cluster-storage-add-form
      storage=storage
      mode=mode
    }}`);

    const helper = new ClusterStorageAddHelper(this.element);

    const pathGroup = helper.getInput('generic-storagePathType');
    expect(pathGroup).to.exist;
    const radio = pathGroup
      .querySelector(`input[type=radio].field-generic-storagePathType-${pathType}`);
    if (radio) {
      if (allow) {
        await click(radio);
        expect(radio).to.be.checked;
      } else {
        expect(radio, 'radio').to.have.attr('disabled');
      }
    } else {
      expect(pathGroup).to.have.trimmed.text(pathType);
    }
  });
}

describe('Integration | Component | cluster-storage-add-form', function () {
  setupRenderingTest();

  beforeEach(function () {
    registerService(this, 'ceph-manager', CephManager);
  });

  context('in show mode', function () {
    it('shows storage details for POSIX type', async function () {
      this.set('storage', POSIX_STORAGE);
      await render(hbs `{{cluster-storage-add-form storage=storage mode="show"}}`);

      const helper = new ClusterStorageAddHelper(this.element);

      // +1 because of 'type' field
      expect(findAll('.form-group')).to.have.length(
        GenericFields.length + PosixFields.length + LumaFields.length + 1
      );
      expect(helper.getInput('type_static-type')).to.contain.text('POSIX');
      [
        'generic_static-name',
        'generic_static-lumaFeed',
        'luma_static-lumaFeedUrl',
        'luma_static-lumaFeedApiKey',
        'posix_static-mountPoint',
        'posix_static-rootUid',
        'posix_static-rootGid',
        'posix_static-timeout',
      ].forEach((fieldName) => {
        expect(helper.getInput(fieldName))
          .to.contain.text(POSIX_STORAGE[fieldName.split('-').pop()]);
      });
      [
        'generic_static-importedStorage',
        'generic_static-readonly',
        'generic_static-skipStorageDetection',
      ].forEach((fieldName) => {
        const toggle = helper.getInput(fieldName).querySelector('.one-way-toggle');
        const shouldBeChecked = POSIX_STORAGE[fieldName.split('-').pop()];
        if (shouldBeChecked) {
          expect(toggle).to.have.class('checked');
        } else {
          expect(toggle).to.not.have.class('checked');
        }
      });
    });
  });

  context('in create mode', function () {
    /**
     * Test against a strange bug that occured when automatically changed readonly toggle
     * @param {{ id: String, name: String }} targetStorageType
     */
    function runNameValidationLockTest(targetStorageType) {
      it(
        `does not block name input by validation after immediate storage type change to ${targetStorageType.name}`,
        async function () {
          this.set('selectedStorageType', CEPH_RADOS_TYPE);

          await render(hbs `
            {{cluster-storage-add-form selectedStorageType=selectedStorageType}}
          `);

          const helper = new ClusterStorageAddHelper(this.element);
          this.set('selectedStorageType', targetStorageType);
          await settled();
          await fillIn(helper.getInput('generic-name'), 'hello');

          expect(find('.has-error'), 'error indicator').to.not.exist;
        }
      );
    }

    runNameValidationLockTest(POSIX_TYPE);
    runNameValidationLockTest(HTTP_TYPE);

    it('renders fields for POSIX storage type if "posix" is selected',
      async function () {
        // +2 because of 'type' field and empty qos parameter field
        const totalFields = Object.keys(GenericFields).length +
          Object.keys(PosixFields).length + 2;

        this.set('selectedStorageType', POSIX_TYPE);
        await render(hbs `
          {{cluster-storage-add-form selectedStorageType=selectedStorageType}}
        `);

        const helper = new ClusterStorageAddHelper(this.element);
        expect(findAll('.form-group:not(.submit-group)'))
          .to.have.length(totalFields);
        [
          'generic-name',
          'posix-mountPoint',
          'posix-timeout',
          'posix-rootUid',
          'posix-rootGid',
        ].forEach(fieldName => {
          expect(helper.getInput(fieldName)).to.exist;
          expect(helper.getInput(fieldName)).to.match('input');
        });
        expect(
          helper.getInput('generic-lumaFeed').querySelectorAll('input[type="radio"]')
        ).to.have.length(3);
        [
          'generic-importedStorage',
          'generic-readonly',
          'generic-skipStorageDetection',
        ].forEach(fieldName => {
          expect(helper.getToggleInput(fieldName)).to.exist;
          expect(helper.getToggleInput(fieldName).querySelector('input')).to.exist;
        });
      }
    );

    it('does not submit empty values for posix', async function () {
      let submitOccurred = false;
      this.setProperties({
        selectedStorageType: {
          id: 'posix',
          name: 'POSIX',
        },
        submit: (formData) => {
          submitOccurred = true;
          expect(formData).to.have.property('name');
          expect(formData.name).to.be.equal('some name');
          expect(formData.importedStorage).to.be.false;
          expect(formData).to.have.property('lumaFeed');
          expect(formData.lumaFeed).to.equal('auto');
          expect(formData).to.have.property('mountPoint');
          expect(formData.mountPoint).to.be.equal('/mnt/st1');
          expect(formData).to.not.have.property('timeout');
          expect(formData).to.not.have.property('skipStorageDetection');
          return resolve();
        },
      });

      await render(hbs `
        {{cluster-storage-add-form
          selectedStorageType=selectedStorageType
          submit=submit
        }}
      `);

      const helper = new ClusterStorageAddHelper(this.element);

      await fillIn(helper.getInput('generic-name'), 'some name');
      await fillIn(helper.getInput('posix-mountPoint'), '/mnt/st1');
      await helper.submit();
      expect(submitOccurred).to.be.true;
    });

    it('shows and hides luma fields', async function () {
      await render(hbs `{{cluster-storage-add-form}}`);

      const lumaSelector = '[class*="field-luma"]';
      const helper = new ClusterStorageAddHelper(this.element);
      let lumaFields = find(lumaSelector);
      expect(lumaFields).to.not.exist;
      await click(
        helper.getInput('generic-lumaFeed')
        .querySelector('.field-generic-lumaFeed-external')
      );
      lumaFields = findAll(lumaSelector);
      expect(lumaFields).to.have.length(2);
      expect(lumaFields[0].closest('.form-group')).to.have.class('fadeIn');
      await click(
        helper.getInput('generic-lumaFeed')
        .querySelector('.field-generic-lumaFeed-local')
      );
      lumaFields = findAll(lumaSelector);
      expect(lumaFields).to.have.length(2);
      expect(lumaFields[0].closest('.form-group'))
        .to.have.class('fadeOut');

    });

    it('resets fields values after storage type change', async function () {
      this.set('selectedStorageType', POSIX_TYPE);
      await render(hbs `
        {{cluster-storage-add-form selectedStorageType=selectedStorageType}}
      `);

      const helper = new ClusterStorageAddHelper(this.element);
      await fillIn(helper.getInput('generic-name'), 'sometext');
      await click(
        helper.getInput('generic-lumaFeed')
        .querySelector('.field-generic-lumaFeed-external')
      );
      await fillIn(helper.getInput('luma-lumaFeedUrl'), 'sometext2');
      this.set('selectedStorageType', S3_TYPE);
      await settled();
      await click(
        helper.getInput('generic-lumaFeed')
        .querySelector('.field-generic-lumaFeed-external')
      );
      expect(helper.getInput('generic-name')).to.have.value('');
      expect(helper.getInput('luma-lumaFeedUrl')).to.have.value('');
    });

    it('resets fields values after change to another type and come back',
      async function () {
        this.set('selectedStorageType', POSIX_TYPE);
        await render(hbs `
          {{cluster-storage-add-form selectedStorageType=selectedStorageType}}
        `);

        const helper = new ClusterStorageAddHelper(this.element);
        await fillIn(helper.getInput('posix-mountPoint'), '/mnt/st1');
        this.set('selectedStorageType', S3_TYPE);
        await settled();
        this.set('selectedStorageType', POSIX_TYPE);
        await settled();
        expect(helper.getInput('posix-mountPoint')).to.have.value('');
      }
    );

    it('resets fields values after form visibility toggle', async function () {
      this.set('isFormOpened', true);
      await render(hbs `{{cluster-storage-add-form isFormOpened=isFormOpened}}`);

      const helper = new ClusterStorageAddHelper(this.element);
      await fillIn(helper.getInput('generic-name'), 'name');
      await click(
        helper.getInput('generic-lumaFeed')
        .querySelector('.field-generic-lumaFeed-external')
      );
      this.set('isFormOpened', false);
      await settled();
      this.set('isFormOpened', true);
      await settled();
      expect(helper.getInput('generic-name')).to.have.value('');
      expect(find('[class*="field-luma"]')).to.not.exist;
    });

    it(
      'sets Readonly toggle to false after setting imported storage to false',
      async function () {
        this.set('storage', POSIX_STORAGE);
        await render(hbs `
          {{cluster-storage-add-form
            storage=storage
            mode="create"
          }}
        `);

        const helper = new ClusterStorageAddHelper(this.element);
        expect(helper.getToggleInput('generic-importedStorage'), 'imported initial')
          .to.not.have.class('disabled');
        expect(helper.getToggleInput('generic-importedStorage'), 'imported initial')
          .to.not.have.class('checked');
        await click(helper.getToggleInput('generic-importedStorage'));

        expect(helper.getToggleInput('generic-readonly'), 'readonly after imported')
          .to.not.have.class('checked');
        await click(helper.getToggleInput('generic-readonly'));

        expect(helper.getToggleInput('generic-readonly'), 'readonly after toggle')
          .to.have.class('checked');
        await click(helper.getToggleInput('generic-importedStorage'));

        expect(
          helper.getToggleInput('generic-readonly'),
          'readonly after import disable'
        ).to.not.have.class('checked');
      }
    );

    it(
      'sets and locks Skip storage detection toggle to true after setting readonly to true',
      async function () {
        this.set('storage', POSIX_STORAGE);
        await render(hbs `
          {{cluster-storage-add-form
            storage=storage
            mode="create"
          }}
        `);

        const helper = new ClusterStorageAddHelper(this.element);
        await click(helper.getToggleInput('generic-importedStorage'));
        expect(helper.getToggleInput('generic-skipStorageDetection'), 'skip initial')
          .to.not.have.class('checked')
          .and.not.have.class('disabled');
        await click(helper.getToggleInput('generic-readonly'));
        expect(helper.getToggleInput('generic-readonly'), 'readonly initial')
          .to.have.class('checked')
          .and.not.have.class('disabled');
        expect(helper.getToggleInput('generic-skipStorageDetection'), 'skip initial')
          .to.have.class('checked')
          .and.have.class('disabled');
      }
    );

    it(
      'restores Skip storage detection value after setting readonly to false',
      async function () {
        this.set('storage', POSIX_STORAGE);
        await render(hbs `
          {{cluster-storage-add-form
            storage=storage
            mode="create"
          }}
        `);

        const helper = new ClusterStorageAddHelper(this.element);
        await click(helper.getToggleInput('generic-importedStorage'));
        await click(helper.getToggleInput('generic-skipStorageDetection'));
        expect(helper.getToggleInput('generic-skipStorageDetection'), 'skip initial')
          .to.have.class('checked')
          .and.not.have.class('disabled');
        await click(helper.getToggleInput('generic-readonly'));
        expect(
            helper.getToggleInput('generic-skipStorageDetection'),
            'skip after check'
          )
          .to.have.class('checked')
          .and.have.class('disabled');
        await click(helper.getToggleInput('generic-readonly'));
        expect(
            helper.getToggleInput('generic-readonly'),
            'readonly after uncheck'
          )
          .to.not.have.class('checked');
        expect(
            helper.getToggleInput('generic-skipStorageDetection'),
            'skip after readonly uncheck'
          )
          .to.have.class('checked')
          .and.not.have.class('disabled');
      }
    );

    it(
      'locks "imported stoarge", "readonly" and "skip storage detection" to true for HTTP storage',
      async function () {
        await render(hbs `{{cluster-storage-add-form}}`);

        const helper = new ClusterStorageAddHelper(this.element);
        await selectChoose('.storage-type-select-group', 'HTTP');

        expect(helper.getToggleInput('generic-importedStorage'), 'importedStorage')
          .to.have.class('checked')
          .and.have.class('disabled');

        expect(helper.getToggleInput('generic-readonly'), 'readonly')
          .to.have.class('checked')
          .and.have.class('disabled');

        expect(helper.getToggleInput('generic-skipStorageDetection'), 'skipStorageDet.')
          .to.have.class('checked')
          .and.have.class('disabled');
      }
    );

    it(
      'unlocks "imported stoarge" and "skip storage detection" when changing type from HTTP',
      async function () {
        await render(hbs `{{cluster-storage-add-form}}`);

        const helper = new ClusterStorageAddHelper(this.element);
        await selectChoose('.storage-type-select-group', 'HTTP');
        await selectChoose('.storage-type-select-group', 'POSIX');

        expect(helper.getToggleInput('generic-importedStorage'), 'importedStorage')
          .to.not.have.class('disabled');

        expect(helper.getToggleInput('generic-skipStorageDetection'), 'skipStorageDet.')
          .to.not.have.class('disabled');
      }
    );

    testAllowCertainPathTypeCreate({
      storageData: POSIX_STORAGE,
      allow: true,
      pathType: 'canonical',
    });

    testAllowCertainPathTypeCreate({
      storageData: POSIX_STORAGE,
      allow: false,
      pathType: 'flat',
    });

    testAllowCertainPathTypeCreate({
      storageData: CEPH_RADOS_STORAGE,
      allow: false,
      pathType: 'canonical',
    });

    testAllowCertainPathTypeCreate({
      storageData: CEPH_RADOS_STORAGE,
      allow: true,
      pathType: 'flat',
    });
  });

  context('in edit mode', function () {
    it('shows storage details for POSIX type', async function () {
      this.set('storage', POSIX_STORAGE);
      await render(hbs `
        {{cluster-storage-add-form
          storage=storage
          mode="edit"}}
      `);

      const helper = new ClusterStorageAddHelper(this.element);
      // +3 because of 'type' field, qos field and submit button row
      expect(findAll('.form-group')).to.have.length(
        GenericFields.length + PosixFields.length + LumaFields.length + 3
      );
      expect(helper.getInput('type_static-type')).to.contain.text('POSIX');
      [
        'generic_editor-name',
        'luma_editor-lumaFeedUrl',
        'luma_editor-lumaFeedApiKey',
        'posix_editor-timeout',
        'posix_editor-mountPoint',
        'posix_editor-rootUid',
        'posix_editor-rootGid',
      ].forEach((fieldName) => {
        expect(helper.getInput(fieldName))
          .to.have.value(String(POSIX_STORAGE[fieldName.split('-').pop()]));
      });
      expect(
        helper.getInput('generic_editor-lumaFeed')
        .querySelector('.field-generic_editor-lumaFeed-external')
      ).to.be.checked;
      [{
        input: 'generic_editor-importedStorage',
        field: 'importedStorage',
      }, {
        input: 'generic_editor-skipStorageDetection',
        field: 'skipStorageDetection',
      }].forEach(({ input, field }) => {
        const toggle = helper.getToggleInput(input);
        const shouldBeChecked = POSIX_STORAGE[field];
        if (shouldBeChecked) {
          expect(toggle).to.have.class('checked');
        } else {
          expect(toggle).to.not.have.class('checked');
        }
      });
    });

    it('luma enabled toggle does not change luma fields values', async function () {
      this.set('storage', POSIX_STORAGE);
      await render(hbs `
        {{cluster-storage-add-form
          storage=storage
          mode="edit"}}
      `);

      const helper = new ClusterStorageAddHelper(this.element);
      await click(helper.getInput('generic_editor-lumaFeed')
        .querySelector('.field-generic_editor-lumaFeed-external')
      );
      await click(helper.getInput('generic_editor-lumaFeed')
        .querySelector('.field-generic_editor-lumaFeed-external')
      );
      expect(helper.getInput('type_static-type')).to.contain.text('POSIX');
      [
        'luma_editor-lumaFeedUrl',
        'luma_editor-lumaFeedApiKey',
      ].forEach((fieldName) => {
        expect(helper.getInput(fieldName)).to.have.value(
          String(POSIX_STORAGE[fieldName.split('-').pop()])
        );
      });
    });

    it('submits only changed data', async function () {
      let submitOccurred = false;
      const storageName = 'newName';
      this.set('submit', (formData) => {
        submitOccurred = true;
        expect(_.keys(formData)).to.have.length(2);
        expect(formData.name).to.be.equal(storageName);
        return resolve();
      });

      this.set('storage', POSIX_STORAGE);
      await render(hbs `
        {{cluster-storage-add-form
          storage=storage
          mode="edit"
          isFormOpened=true
          submit=submit}}
      `);

      const helper = new ClusterStorageAddHelper(this.element);
      await fillIn(helper.getInput('generic_editor-name'), storageName);
      await fillIn(helper.getInput('posix_editor-mountPoint'), 'someMountPoint');
      await fillIn(
        helper.getInput('posix_editor-mountPoint'),
        POSIX_STORAGE.mountPoint
      );
      await helper.submit();
      await click(globals.document.querySelector('.modify-storage-modal .proceed'));
      expect(submitOccurred).to.be.true;
    });

    it('submits null value for cleared out optional fields', async function () {
      let submitOccurred = false;
      this.set('submit', (formData) => {
        submitOccurred = true;
        expect(_.keys(formData)).to.have.length(2);
        expect(formData.lumaFeedApiKey).to.be.null;
        return resolve();
      });

      this.set('storage', POSIX_STORAGE);
      await render(hbs `
        {{cluster-storage-add-form
          storage=storage
          mode="edit"
          submit=submit}}
      `);

      const helper = new ClusterStorageAddHelper(this.element);
      await fillIn(helper.getInput('luma_editor-lumaFeedApiKey'), '');
      await helper.submit();
      await click(globals.document.querySelector('.modify-storage-modal .proceed'));

      expect(submitOccurred).to.be.true;
    });

    it('does not remember editor values while edit -> show -> edit cycle',
      async function () {
        this.setProperties({
          storage: POSIX_STORAGE,
          mode: 'edit',
        });
        await render(hbs `
          {{cluster-storage-add-form
            storage=storage
            mode=mode
            submit=submit}}
        `);

        const helper = new ClusterStorageAddHelper(this.element);
        await fillIn(helper.getInput('generic_editor-name'), 'someVal');
        this.set('mode', 'show');
        await settled();
        expect(helper.getInput('generic_static-name'))
          .to.contain.text(POSIX_STORAGE.name);
        this.set('mode', 'edit');
        await settled();
        expect(helper.getInput('generic_editor-name'))
          .to.have.value(POSIX_STORAGE.name);
      }
    );

    it(
      'does not disable "Imported storage" when storageProvidesSupport is false',
      async function () {
        this.set('storage', POSIX_STORAGE);
        await render(hbs `
          {{cluster-storage-add-form
            storageProvidesSupport=false
            storage=storage
            mode="edit"}}
        `);

        const helper = new ClusterStorageAddHelper(this.element);
        expect(helper.getToggleInput('generic_editor-importedStorage'))
          .to.not.have.class('disabled');
      }
    );

    it('disables "Imported storage" when storageProvidesSupport is true',
      async function () {
        this.set('storage', POSIX_STORAGE);
        await render(hbs `
          {{cluster-storage-add-form
            storageProvidesSupport=true
            storage=storage
            mode="edit"}}
        `);

        const helper = new ClusterStorageAddHelper(this.element);
        expect(
          helper.getToggleInput('generic_editor-importedStorage'),
          'imported storage'
        ).to.have.class('disabled');
      }
    );

    it(
      'restores "Imported storage" field original value when this field has been disabled',
      async function () {
        this.set('storage', POSIX_STORAGE);
        this.set('storageProvidesSupport', false);
        const submitStub = sinon.stub().resolves();
        this.set('submit', submitStub);
        await render(hbs `
          {{cluster-storage-add-form
            storageProvidesSupport=storageProvidesSupport
            storage=storage
            mode="edit"
            submit=submit
          }}
        `);

        const helper = new ClusterStorageAddHelper(this.element);
        expect(helper.getToggleInput('generic_editor-importedStorage'))
          .to.have.class('checked');
        await click(helper.getToggleInput('generic_editor-importedStorage'));
        expect(helper.getToggleInput('generic_editor-importedStorage'))
          .to.not.have.class('checked');
        this.set('storageProvidesSupport', true);
        await settled();
        expect(helper.getToggleInput('generic_editor-importedStorage'))
          .to.have.class('checked');
        await helper.submit();
        await click(globals.document.querySelector('.modify-storage-modal .proceed'));
        expect(submitStub).to.be.calledWith(
          sinon.match(formData => formData.importedStorage === undefined)
        );
      }
    );

    it(
      'locks "imported storage", "readonly" and "skip storage detection" to true for HTTP storage',
      async function () {
        this.set('storage', HTTP_STORAGE);
        await render(hbs `{{cluster-storage-add-form
          storage=storage
          mode="edit"
        }}`);

        const helper = new ClusterStorageAddHelper(this.element);

        expect(helper.getToggleInput('generic_editor-importedStorage'), 'importedStorage')
          .to.have.class('checked')
          .and.have.class('disabled');

        expect(helper.getToggleInput('generic_editor-readonly'), 'readonly')
          .to.have.class('checked')
          .and.have.class('disabled');

        expect(
          helper.getToggleInput('generic_editor-skipStorageDetection'),
          'skipStorageDet.'
        ).to.have.class('checked').and.have.class('disabled');
      });

    it(
      'locks "imported storage", "readonly" and "skip storage detection" to true for HTTP storage after change from show mode',
      async function () {
        this.setProperties({
          storage: HTTP_STORAGE,
          mode: 'show',
        });
        await render(hbs `{{cluster-storage-add-form
          storage=storage
          mode=mode
        }}`);

        this.set('mode', 'edit');

        await settled();

        const helper = new ClusterStorageAddHelper(this.element);

        expect(helper.getToggleInput('generic_editor-importedStorage'), 'importedStorage')
          .to.have.class('checked')
          .and.have.class('disabled');

        expect(helper.getToggleInput('generic_editor-readonly'), 'readonly')
          .to.have.class('checked')
          .and.have.class('disabled');

        expect(
          helper.getToggleInput('generic_editor-skipStorageDetection'),
          'skipStorageDet.'
        ).to.have.class('checked').and.have.class('disabled');
      });

    it(
      'locks "imported storage" to true for non-HTTP storage with enabled import and provides support after change from show mode',
      async function () {
        this.setProperties({
          storage: POSIX_STORAGE,
          mode: 'show',
        });
        await render(hbs `{{cluster-storage-add-form
          storage=storage
          mode=mode
          storageProvidesSupport=true
        }}`);

        const helper = new ClusterStorageAddHelper(this.element);
        expect(
            helper.getInput('generic_static-importedStorage')
            .querySelector('.one-way-toggle'),
            'show'
          )
          .to.have.class('checked')
          .and.have.class('disabled');
        this.set('mode', 'edit');
        await settled();
        expect(helper.getToggleInput('generic_editor-importedStorage'), 'edit')
          .to.have.class('checked')
          .and.have.class('disabled');
      });

    testNotAllowPathTypeEdit(POSIX_STORAGE);
  });
});
