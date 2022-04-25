import { expect } from 'chai';
import { describe, it, beforeEach, context } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import wait from 'ember-test-helpers/wait';
import hbs from 'htmlbars-inline-precompile';
import _ from 'lodash';
import { registerService } from '../../helpers/stub-service';
import Service from '@ember/service';
import { resolve } from 'rsvp';
import $ from 'jquery';
import { click } from 'ember-native-dom-helpers';
import sinon from 'sinon';
import FormHelper from '../../helpers/form';
import GenericFields from 'onepanel-gui/utils/cluster-storage/generic-fields';
import PosixFields from 'onepanel-gui/utils/cluster-storage/posix-fields';
import LumaFields from 'onepanel-gui/utils/cluster-storage/luma-fields';
import { selectChoose } from 'ember-power-select/test-support/helpers';

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

  // TODO: VFS-8903 remove two methods below
  getInput() {
    return $(super.getInput(...arguments));
  }

  getToggleInput() {
    return $(super.getToggleInput(...arguments));
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
  it(`does not allow to edit path type of storage with type "${storageType}"`, async function (done) {
    this.setProperties({
      storage: storageData,
      mode: 'edit',
    });
    await render(hbs `{{cluster-storage-add-form
      storage=storage
      mode=mode
      storageProvidesSupport=true
    }}`);

    await wait();
    const helper = new ClusterStorageAddHelper(this.element);

    const pathGroup = helper.getInput('generic_editor-storagePathType');
    expect(pathGroup).to.exist;
    const anyInput = pathGroup.find('input');
    expect(anyInput, 'any input').to.not.exist;
    const staticValue = pathGroup.text().trim();
    expect(staticValue).to.equal(storageData.storagePathType);
    done();
  });
}

async function testAllowCertainPathTypeCreate({
  storageData,
  allow,
  pathType,
  storageType = storageData.type,
}) {
  const allowText = allow ? 'allows' : 'does not allow';
  it(`${allowText} to set "${pathType}" path type of storage with type "${storageType}"`, async function (done) {
    this.setProperties({
      storage: storageData,
      mode: 'create',
    });
    await render(hbs `{{cluster-storage-add-form
      storage=storage
      mode=mode
    }}`);

    await wait();
    const helper = new ClusterStorageAddHelper(this.element);

    const pathGroup = helper.getInput('generic-storagePathType');
    expect(pathGroup).to.exist;
    const $radio = pathGroup
      .find(`input[type=radio].field-generic-storagePathType-${pathType}`);
    const radio = $radio[0];
    if ($radio.length) {
      if (allow) {
        radio.click();
        await wait();
        expect(radio.checked).to.equal(allow);
      } else {
        expect($radio, 'radio').to.have.attr('disabled');
      }
    } else {
      const value = pathGroup.text().trim();
      expect(value).to.equal(pathType);
    }
    done();
  });
}

describe('Integration | Component | cluster storage add form', function () {
  setupRenderingTest();

  beforeEach(function () {
    registerService(this, 'ceph-manager', CephManager);
  });

  context('in show mode', function () {
    it('shows storage details for POSIX type', async function (done) {
      this.set('storage', POSIX_STORAGE);
      await render(hbs `{{cluster-storage-add-form storage=storage mode="show"}}`);

      return wait().then(() => {
        const helper = new ClusterStorageAddHelper(this.element);

        // +1 because of 'type' field
        expect(this.$('.form-group')).to.have.length(
          GenericFields.length + PosixFields.length + LumaFields.length + 1
        );
        expect(helper.getInput('type_static-type').text()).to.contain('POSIX');
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
          expect(helper.getInput(fieldName).text())
            .to.contain(POSIX_STORAGE[fieldName.split('-').pop()]);
        });
        [
          'generic_static-importedStorage',
          'generic_static-readonly',
          'generic_static-skipStorageDetection',
        ].forEach((fieldName) => {
          expect(
            helper.getInput(fieldName).find('.one-way-toggle')
            .hasClass('checked')
          ).to.be.equal(POSIX_STORAGE[fieldName.split('-').pop()]);
        });
        done();
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
        async function (done) {
          this.set('selectedStorageType', CEPH_RADOS_TYPE);

          await render(hbs `
            {{cluster-storage-add-form selectedStorageType=selectedStorageType}}
          `);

          await wait();
          const helper = new ClusterStorageAddHelper(this.element);
          this.set('selectedStorageType', targetStorageType);
          await wait();
          helper.getInput('generic-name').val('hello').change();
          await wait();

          expect(this.$('.has-error'), 'error indicator').to.not.exist;
          done();
        }
      );
    }

    runNameValidationLockTest(POSIX_TYPE);
    runNameValidationLockTest(HTTP_TYPE);

    it('renders fields for POSIX storage type if "posix" is selected',
      async function (done) {
        // +2 because of 'type' field and empty qos parameter field
        const totalFields = Object.keys(GenericFields).length +
          Object.keys(PosixFields).length + 2;

        this.set('selectedStorageType', POSIX_TYPE);
        await render(hbs `
          {{cluster-storage-add-form selectedStorageType=selectedStorageType}}
        `);

        return wait().then(() => {
          const helper = new ClusterStorageAddHelper(this.element);
          expect(this.$('.form-group:not(.submit-group)'))
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
          expect(helper.getInput('generic-lumaFeed').find('input[type="radio"]'))
            .to.have.length(3);
          [
            'generic-importedStorage',
            'generic-readonly',
            'generic-skipStorageDetection',
          ].forEach(fieldName => {
            expect(helper.getToggleInput(fieldName)).to.exist;
            expect(helper.getToggleInput(fieldName).find('input')).to.exist;
          });
          done();
        });
      }
    );

    it('does not submit empty values for posix', async function (done) {
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

      return wait().then(() => {
        const helper = new ClusterStorageAddHelper(this.element);

        helper.getInput('generic-name').val('some name').change();
        helper.getInput('posix-mountPoint').val('/mnt/st1').change();
        return wait().then(() => {
          helper.submit();
          return wait().then(() => {
            expect(submitOccurred).to.be.true;
            done();
          });
        });
      });
    });

    it('shows and hides luma fields', async function (done) {
      await render(hbs `{{cluster-storage-add-form}}`);

      const lumaSelector = '[class*="field-luma"]';
      return wait().then(() => {
        const helper = new ClusterStorageAddHelper(this.element);
        let lumaFields = this.$(lumaSelector);
        expect(lumaFields).to.have.length(0);
        helper.getInput('generic-lumaFeed')
          .find('.field-generic-lumaFeed-external').click();
        return wait().then(() => {
          lumaFields = this.$(lumaSelector);
          expect(lumaFields).to.have.length(2);
          expect(lumaFields.parents('.form-group')).to.have.class('fadeIn');
          helper.getInput('generic-lumaFeed')
            .find('.field-generic-lumaFeed-local').click();
          return wait().then(() => {
            lumaFields = this.$(lumaSelector);
            expect(lumaFields).to.have.length(2);
            expect(lumaFields.parents('.form-group'))
              .to.have.class('fadeOut');
            done();
          });
        });
      });
    });

    it('resets fields values after storage type change', async function (done) {
      this.set('selectedStorageType', POSIX_TYPE);
      await render(hbs `
        {{cluster-storage-add-form selectedStorageType=selectedStorageType}}
      `);

      return wait().then(() => {
        const helper = new ClusterStorageAddHelper(this.element);

        helper.getInput('generic-name').val('sometext').change();
        helper.getInput('generic-lumaFeed')
          .find('.field-generic-lumaFeed-external').click();
        return wait().then(() => {
          helper.getInput('luma-lumaFeedUrl').val('sometext2').change();
          return wait().then(() => {
            this.set('selectedStorageType', S3_TYPE);
            return wait().then(() => {
              helper.getInput('generic-lumaFeed')
                .find('.field-generic-lumaFeed-external').click();
              return wait().then(() => {
                expect(helper.getInput('generic-name').val())
                  .to.be.empty;
                expect(helper.getInput('luma-lumaFeedUrl').val())
                  .to.be.empty;
                done();
              });
            });
          });
        });
      });
    });

    it('resets fields values after change to another type and come back',
      async function (done) {

        this.set('selectedStorageType', POSIX_TYPE);
        await render(hbs `
          {{cluster-storage-add-form selectedStorageType=selectedStorageType}}
        `);

        return wait().then(() => {
          const helper = new ClusterStorageAddHelper(this.element);
          helper.getInput('posix-mountPoint').val('/mnt/st1').change();
          return wait().then(() => {
            this.set('selectedStorageType', S3_TYPE);
            return wait().then(() => {
              this.set('selectedStorageType', POSIX_TYPE);
              return wait().then(() => {
                expect(helper.getInput('posix-mountPoint').val())
                  .to.be.empty;
                done();
              });
            });
          });
        });
      }
    );

    it('resets fields values after form visibility toggle', async function (done) {
      this.set('isFormOpened', true);
      await render(hbs `{{cluster-storage-add-form isFormOpened=isFormOpened}}`);

      return wait().then(() => {
        const helper = new ClusterStorageAddHelper(this.element);

        helper.getInput('generic-name').val('name').change();
        helper.getInput('generic-lumaFeed')
          .find('.field-generic-lumaFeed-external').click();
        return wait().then(() => {
          this.set('isFormOpened', false);
          return wait().then(() => {
            this.set('isFormOpened', true);
            return wait().then(() => {
              expect(helper.getInput('generic-name').val())
                .to.be.empty;
              expect(this.$('[class*="field-luma"]'))
                .to.have.length(0);
              done();
            });
          });
        });
      });
    });

    it('does not disable "Imported storage" regardless the storageProvidesSupport value',
      async function (done) {
        this.set('storage', POSIX_STORAGE);
        await render(hbs `
          {{cluster-storage-add-form
            storageProvidesSupport=true
            storage=storage
            mode="create"}}
        `);

        return wait().then(() => {
          const helper = new ClusterStorageAddHelper(this.element);
          expect(helper.getToggleInput('generic_editor-importedStorage'))
            .to.not.have.class('disabled');
          done();
        });
      }
    );

    it(
      'sets Readonly toggle to false after setting imported storage to false',
      async function (done) {
        this.set('storage', POSIX_STORAGE);
        await render(hbs `
          {{cluster-storage-add-form
            storage=storage
            mode="create"
          }}
        `);

        await wait();

        const helper = new ClusterStorageAddHelper(this.element);
        expect(helper.getToggleInput('generic-importedStorage'), 'imported initial')
          .to.not.have.class('disabled');
        expect(helper.getToggleInput('generic-importedStorage'), 'imported initial')
          .to.not.have.class('checked');
        await click(helper.getToggleInput('generic-importedStorage')[0]);

        expect(helper.getToggleInput('generic-readonly'), 'readonly after imported')
          .to.not.have.class('checked');
        await click(helper.getToggleInput('generic-readonly')[0]);

        expect(helper.getToggleInput('generic-readonly'), 'readonly after toggle')
          .to.have.class('checked');
        await click(helper.getToggleInput('generic-importedStorage')[0]);

        expect(
          helper.getToggleInput('generic-readonly'),
          'readonly after import disable'
        ).to.not.have.class('checked');
        done();
      }
    );

    it(
      'sets and locks Skip storage detection toggle to true after setting readonly to true',
      async function (done) {
        this.set('storage', POSIX_STORAGE);
        await render(hbs `
          {{cluster-storage-add-form
            storage=storage
            mode="create"
          }}
        `);

        let helper;
        return wait()
          .then(() => {
            helper = new ClusterStorageAddHelper(this.element);
            return click(helper.getToggleInput('generic-importedStorage')[0]);
          })
          .then(() => {
            expect(helper.getToggleInput('generic-skipStorageDetection'), 'skip initial')
              .to.not.have.class('checked')
              .and.not.have.class('disabled');
            return click(helper.getToggleInput('generic-readonly')[0]);
          })
          .then(() => {
            expect(helper.getToggleInput('generic-readonly'), 'readonly initial')
              .to.have.class('checked')
              .and.not.have.class('disabled');
            expect(helper.getToggleInput('generic-skipStorageDetection'), 'skip initial')
              .to.have.class('checked')
              .and.have.class('disabled');
            done();
          });
      }
    );

    it(
      'restores Skip storage detection value after setting readonly to false',
      async function (done) {
        this.set('storage', POSIX_STORAGE);
        await render(hbs `
          {{cluster-storage-add-form
            storage=storage
            mode="create"
          }}
        `);

        let helper;
        return wait()
          .then(() => {
            helper = new ClusterStorageAddHelper(this.element);
            return click(helper.getToggleInput('generic-importedStorage')[0]);
          })
          .then(() => {
            return click(helper.getToggleInput('generic-skipStorageDetection')[0]);
          })
          .then(() => {
            expect(helper.getToggleInput('generic-skipStorageDetection'), 'skip initial')
              .to.have.class('checked')
              .and.not.have.class('disabled');
            return click(helper.getToggleInput('generic-readonly')[0]);
          })
          .then(() => {
            expect(
                helper.getToggleInput('generic-skipStorageDetection'),
                'skip after check'
              )
              .to.have.class('checked')
              .and.have.class('disabled');
            return click(helper.getToggleInput('generic-readonly')[0]);
          })
          .then(() => {
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
            done();
          });
      }
    );

    it(
      'locks "imported stoarge", "readonly" and "skip storage detection" to true for HTTP storage',
      async function (done) {
        await render(hbs `{{cluster-storage-add-form}}`);

        await wait();
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
        done();
      }
    );

    it(
      'unlocks "imported stoarge" and "skip storage detection" when changing type from HTTP',
      async function (done) {
        await render(hbs `{{cluster-storage-add-form}}`);

        await wait();
        const helper = new ClusterStorageAddHelper(this.element);
        await selectChoose('.storage-type-select-group', 'HTTP');
        await selectChoose('.storage-type-select-group', 'POSIX');

        expect(helper.getToggleInput('generic-importedStorage'), 'importedStorage')
          .to.not.have.class('disabled');

        expect(helper.getToggleInput('generic-skipStorageDetection'), 'skipStorageDet.')
          .to.not.have.class('disabled');
        done();
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
    it('shows storage details for POSIX type', async function (done) {
      this.set('storage', POSIX_STORAGE);
      await render(hbs `
        {{cluster-storage-add-form
          storage=storage
          mode="edit"}}
      `);

      return wait().then(() => {
        const helper = new ClusterStorageAddHelper(this.element);
        // +3 because of 'type' field, qos field and submit button row
        expect(this.$('.form-group')).to.have.length(
          GenericFields.length + PosixFields.length + LumaFields.length + 3
        );
        expect(helper.getInput('type_static-type').text()).to.contain('POSIX');
        [
          'generic_editor-name',
          'luma_editor-lumaFeedUrl',
          'luma_editor-lumaFeedApiKey',
          'posix_editor-timeout',
          'posix_editor-mountPoint',
          'posix_editor-rootUid',
          'posix_editor-rootGid',
        ].forEach((fieldName) => {
          expect(helper.getInput(fieldName).val())
            .to.be.equal(String(POSIX_STORAGE[fieldName.split('-').pop()]));
        });
        expect(
          helper.getInput('generic_editor-lumaFeed')
          .find('.field-generic_editor-lumaFeed-external')
        ).to.have.prop('checked', true);
        [{
          input: 'generic_editor-importedStorage',
          field: 'importedStorage',
        }, {
          input: 'generic_editor-skipStorageDetection',
          field: 'skipStorageDetection',
        }].forEach(({ input, field }) => {
          expect(helper.getToggleInput(input).hasClass('checked'))
            .to.be.equal(POSIX_STORAGE[field]);
        });
        done();
      });
    });

    it('luma enabled toggle does not change luma fields values', async function (done) {
      this.set('storage', POSIX_STORAGE);
      await render(hbs `
        {{cluster-storage-add-form
          storage=storage
          mode="edit"}}
      `);

      return wait().then(() => {
        const helper = new ClusterStorageAddHelper(this.element);
        helper.getInput('generic_editor-lumaFeed')
          .find('.field-generic_editor-lumaFeed-external').click();
        return wait().then(() => {
          helper.getInput('generic_editor-lumaFeed')
            .find('.field-generic_editor-lumaFeed-external').click();
          return wait().then(() => {
            expect(helper.getInput('type_static-type').text())
              .to.contain('POSIX');
            [
              'luma_editor-lumaFeedUrl',
              'luma_editor-lumaFeedApiKey',
            ].forEach((fieldName) => {
              expect(helper.getInput(fieldName).val()).to.be.equal(
                String(POSIX_STORAGE[fieldName.split('-').pop()])
              );
            });
            done();
          });
        });
      });
    });

    it('submits only changed data', async function (done) {
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

      return wait().then(() => {
        const helper = new ClusterStorageAddHelper(this.element);
        helper.getInput('generic_editor-name').val(storageName).change();
        helper.getInput('posix_editor-mountPoint').val('someMountPoint').change();
        return wait().then(() => {
          helper.getInput('posix_editor-mountPoint')
            .val(POSIX_STORAGE.mountPoint).change();
          return wait().then(() => {
            helper.submit();
            return wait().then(() => {
              $('.modify-storage-modal .proceed').click();
              return wait().then(() => {
                expect(submitOccurred).to.be.true;
                done();
              });
            });
          });
        });
      });
    });

    it('submits null value for cleared out optional fields', async function (done) {
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

      return wait().then(() => {
        const helper = new ClusterStorageAddHelper(this.element);
        helper.getInput('luma_editor-lumaFeedApiKey').val('').change();
        return wait().then(() => {
          helper.submit();
          return wait().then(() => {
            $('.modify-storage-modal .proceed').click();
            return wait().then(() => {
              expect(submitOccurred).to.be.true;
              done();
            });
          });
        });
      });
    });

    it('does not remember editor values while edit -> show -> edit cycle',
      async function (done) {
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

        return wait().then(() => {
          const helper = new ClusterStorageAddHelper(this.element);
          helper.getInput('generic_editor-name').val('someVal').change();
          return wait().then(() => {
            this.set('mode', 'show');
            return wait().then(() => {
              expect(helper.getInput('generic_static-name').text())
                .to.contain(POSIX_STORAGE.name);
              this.set('mode', 'edit');
              return wait().then(() => {
                expect(helper.getInput('generic_editor-name').val())
                  .to.be.equal(POSIX_STORAGE.name);
                done();
              });
            });
          });
        });
      }
    );

    it(
      'does not disable "Imported storage" when storageProvidesSupport is false',
      async function (done) {
        this.set('storage', POSIX_STORAGE);
        await render(hbs `
          {{cluster-storage-add-form
            storageProvidesSupport=false
            storage=storage
            mode="edit"}}
        `);

        return wait().then(() => {
          const helper = new ClusterStorageAddHelper(this.element);
          expect(helper.getToggleInput('generic_editor-importedStorage'))
            .to.not.have.class('disabled');
          done();
        });
      }
    );

    it('disables "Imported storage" when storageProvidesSupport is true',
      async function (done) {
        this.set('storage', POSIX_STORAGE);
        await render(hbs `
          {{cluster-storage-add-form
            storageProvidesSupport=true
            storage=storage
            mode="edit"}}
        `);

        return wait().then(() => {
          const helper = new ClusterStorageAddHelper(this.element);
          expect(
            helper.getToggleInput('generic_editor-importedStorage'),
            'imported storage'
          ).to.have.class('disabled');
          done();
        });
      }
    );

    it(
      'restores "Imported storage" field original value when this field has been disabled',
      async function (done) {
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

        let helper;
        return wait()
          .then(() => {
            helper = new ClusterStorageAddHelper(this.element);
            expect(helper.getToggleInput('generic_editor-importedStorage'))
              .to.have.class('checked');
            return click(helper.getToggleInput('generic_editor-importedStorage')[0]);
          })
          .then(() => {
            expect(helper.getToggleInput('generic_editor-importedStorage'))
              .to.not.have.class('checked');
            this.set('storageProvidesSupport', true);
            return wait();
          })
          .then(() => {
            expect(helper.getToggleInput('generic_editor-importedStorage'))
              .to.have.class('checked');
            return helper.submit();
          })
          .then(() => click($('.modify-storage-modal .proceed')[0]))
          .then(() => {
            expect(submitStub).to.be.calledWith(
              sinon.match(formData => formData.importedStorage === undefined)
            );
            done();
          });
      }
    );

    it(
      'locks "imported storage", "readonly" and "skip storage detection" to true for HTTP storage',
      async function (done) {
        this.set('storage', HTTP_STORAGE);
        await render(hbs `{{cluster-storage-add-form
          storage=storage
          mode="edit"
        }}`);

        await wait();
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
        done();
      });

    it(
      'locks "imported storage", "readonly" and "skip storage detection" to true for HTTP storage after change from show mode',
      async function (done) {
        this.setProperties({
          storage: HTTP_STORAGE,
          mode: 'show',
        });
        await render(hbs `{{cluster-storage-add-form
          storage=storage
          mode=mode
        }}`);

        await wait();

        this.set('mode', 'edit');

        await wait();

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
        done();
      });

    it(
      'locks "imported storage" to true for non-HTTP storage with enabled import and provides support after change from show mode',
      async function (done) {
        this.setProperties({
          storage: POSIX_STORAGE,
          mode: 'show',
        });
        await render(hbs `{{cluster-storage-add-form
          storage=storage
          mode=mode
          storageProvidesSupport=true
        }}`);

        await wait();
        const helper = new ClusterStorageAddHelper(this.element);
        expect(
            helper.getInput('generic_static-importedStorage').find('.one-way-toggle'),
            'show'
          )
          .to.have.class('checked')
          .and.have.class('disabled');
        this.set('mode', 'edit');
        await wait();
        expect(helper.getToggleInput('generic_editor-importedStorage'), 'edit')
          .to.have.class('checked')
          .and.have.class('disabled');
        done();
      });

    testNotAllowPathTypeEdit(POSIX_STORAGE);
  });
});
