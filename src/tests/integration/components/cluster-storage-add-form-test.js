import { expect } from 'chai';
import { describe, it, beforeEach, context } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
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

const CephManager = Service.extend({
  getOsds() {
    return resolve([]);
  },

  suppressNotDeployed(promise) {
    return promise;
  },
});

class ClusterStorageAddHelper extends FormHelper {
  constructor($template) {
    super($template, '.cluster-storage-add-form');
  }
}

const POSIX_TYPE = {
  id: 'posix',
  name: 'POSIX',
};

const S3_TYPE = {
  id: 's3',
  name: 'S3',
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
  timeout: 20,
  skipStorageDetection: true,
  readonly: true,
  name: 'Some storage',
};

describe('Integration | Component | cluster storage add form', function () {
  setupComponentTest('cluster-storage-add-form', {
    integration: true,
  });

  beforeEach(function () {
    registerService(this, 'cephManager', CephManager);
  });

  context('in show mode', function () {
    it('shows storage details', function () {
      this.set('storage', POSIX_STORAGE);
      this.render(hbs `{{cluster-storage-add-form storage=storage mode="show"}}`);

      return wait().then(() => {
        const helper = new ClusterStorageAddHelper(this.$());

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
      });
    });
  });

  context('in create mode', function () {
    it('renders fields for POSIX storage type if "posix" is selected',
      function () {
        // +2 because of 'type' field and empty qos parameter field
        const totalFields = Object.keys(GenericFields).length +
          Object.keys(PosixFields).length + 2;

        this.set('selectedStorageType', POSIX_TYPE);
        this.render(hbs `
          {{cluster-storage-add-form selectedStorageType=selectedStorageType}}
        `);

        return wait().then(() => {
          const helper = new ClusterStorageAddHelper(this.$());
          expect(this.$('.form-group:not(.submit-group)'))
            .to.have.length(totalFields);
          [
            'generic-name',
            'posix-mountPoint',
            'posix-timeout',
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
        });
      }
    );

    it('does not submit empty values for posix', function () {
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
          return Promise.resolve();
        },
      });

      this.render(hbs `
        {{cluster-storage-add-form
          selectedStorageType=selectedStorageType
          submit=submit
        }}
      `);

      return wait().then(() => {
        const helper = new ClusterStorageAddHelper(this.$());

        helper.getInput('generic-name').val('some name').change();
        helper.getInput('posix-mountPoint').val('/mnt/st1').change();
        return wait().then(() => {
          helper.submit();
          return wait().then(() => {
            expect(submitOccurred).to.be.true;
          });
        });
      });
    });

    it('shows and hides luma fields', function () {
      this.render(hbs `{{cluster-storage-add-form}}`);

      const lumaSelector = '[class*="field-luma"]';
      return wait().then(() => {
        const helper = new ClusterStorageAddHelper(this.$());
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
          });
        });
      });
    });

    it('resets fields values after storage type change', function () {
      this.set('selectedStorageType', POSIX_TYPE);
      this.render(hbs `
        {{cluster-storage-add-form selectedStorageType=selectedStorageType}}
      `);

      return wait().then(() => {
        const helper = new ClusterStorageAddHelper(this.$());

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
              });
            });
          });
        });
      });
    });

    it('resets fields values after change to another type and come back',
      function () {

        this.set('selectedStorageType', POSIX_TYPE);
        this.render(hbs `
          {{cluster-storage-add-form selectedStorageType=selectedStorageType}}
        `);

        return wait().then(() => {
          const helper = new ClusterStorageAddHelper(this.$());
          helper.getInput('posix-mountPoint').val('/mnt/st1').change();
          return wait().then(() => {
            this.set('selectedStorageType', S3_TYPE);
            return wait().then(() => {
              this.set('selectedStorageType', POSIX_TYPE);
              return wait().then(() => {
                expect(helper.getInput('posix-mountPoint').val())
                  .to.be.empty;
              });
            });
          });
        });
      }
    );

    it('resets fields values after form visibility toggle', function () {
      this.set('isFormOpened', true);
      this.render(hbs `{{cluster-storage-add-form isFormOpened=isFormOpened}}`);

      return wait().then(() => {
        const helper = new ClusterStorageAddHelper(this.$());

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
            });
          });
        });
      });
    });

    it(
      'does not disable "Imported storage" regardless the storageProvidesSupport value',
      function () {
        this.set('storage', POSIX_STORAGE);
        this.render(hbs `
          {{cluster-storage-add-form
            storageProvidesSupport=true
            storage=storage 
            mode="create"}}
        `);

        return wait().then(() => {
          const helper = new ClusterStorageAddHelper(this.$());
          expect(helper.getToggleInput('generic_editor-importedStorage'))
            .to.not.have.class('disabled');
        });
      }
    );
  });

  context('in edit mode', function () {
    it('shows storage details', function () {
      this.set('storage', POSIX_STORAGE);
      this.render(hbs `
        {{cluster-storage-add-form
          storage=storage 
          mode="edit"}}
      `);

      return wait().then(() => {
        const helper = new ClusterStorageAddHelper(this.$());
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
      });
    });

    it('luma enabled toggle does not change luma fields values', function () {
      this.set('storage', POSIX_STORAGE);
      this.render(hbs `
        {{cluster-storage-add-form
          storage=storage 
          mode="edit"}}
      `);

      return wait().then(() => {
        const helper = new ClusterStorageAddHelper(this.$());
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
          });
        });
      });
    });

    it('submits only changed data', function () {
      let submitOccurred = false;
      const storageName = 'newName';
      this.set('submit', (formData) => {
        submitOccurred = true;
        expect(_.keys(formData)).to.have.length(2);
        expect(formData.name).to.be.equal(storageName);
        return Promise.resolve();
      });

      this.set('storage', POSIX_STORAGE);
      this.render(hbs `
        {{cluster-storage-add-form
          storage=storage 
          mode="edit"
          isFormOpened=true
          submit=submit}}
      `);

      return wait().then(() => {
        const helper = new ClusterStorageAddHelper(this.$());
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
              });
            });
          });
        });
      });
    });

    it('submits null value for cleared out optional fields', function () {
      let submitOccurred = false;
      this.set('submit', (formData) => {
        submitOccurred = true;
        expect(_.keys(formData)).to.have.length(2);
        expect(formData.lumaFeedApiKey).to.be.null;
        return Promise.resolve();
      });

      this.set('storage', POSIX_STORAGE);
      this.render(hbs `
        {{cluster-storage-add-form
          storage=storage 
          mode="edit"
          submit=submit}}
      `);

      return wait().then(() => {
        const helper = new ClusterStorageAddHelper(this.$());
        helper.getInput('luma_editor-lumaFeedApiKey').val('').change();
        return wait().then(() => {
          helper.submit();
          return wait().then(() => {
            $('.modify-storage-modal .proceed').click();
            return wait().then(() => {
              expect(submitOccurred).to.be.true;
            });
          });
        });
      });
    });

    it('does not remember editor values while edit -> show -> edit cycle',
      function () {
        this.setProperties({
          storage: POSIX_STORAGE,
          mode: 'edit',
        });
        this.render(hbs `
          {{cluster-storage-add-form
            storage=storage 
            mode=mode
            submit=submit}}
        `);

        return wait().then(() => {
          let helper = new ClusterStorageAddHelper(this.$());
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
              });
            });
          });
        });
      }
    );

    it(
      'does not disable "Imported storage" when storageProvidesSupport is false',
      function () {
        this.set('storage', POSIX_STORAGE);
        this.render(hbs `
          {{cluster-storage-add-form
            storageProvidesSupport=false
            storage=storage 
            mode="edit"}}
        `);

        return wait().then(() => {
          const helper = new ClusterStorageAddHelper(this.$());
          expect(helper.getToggleInput('generic_editor-importedStorage'))
            .to.not.have.class('disabled');
        });
      }
    );

    it('disables "Imported storage" when storageProvidesSupport is true',
      function () {
        this.set('storage', POSIX_STORAGE);
        this.render(hbs `
          {{cluster-storage-add-form
            storageProvidesSupport=true
            storage=storage 
            mode="edit"}}
        `);

        return wait().then(() => {
          const helper = new ClusterStorageAddHelper(this.$());
          expect(helper.getToggleInput('generic_editor-importedStorage'))
            .to.have.class('disabled');
        });
      }
    );

    it(
      'restores "Imported storage" field original value when this field has been disabled',
      function () {
        this.set('storage', POSIX_STORAGE);
        this.set('storageProvidesSupport', false);
        const submitStub = sinon.stub().resolves();
        this.on('submit', submitStub);
        this.render(hbs `
          {{cluster-storage-add-form
            storageProvidesSupport=storageProvidesSupport
            storage=storage 
            mode="edit"
            submit=(action "submit")}}
        `);

        let helper;
        return wait()
          .then(() => {
            helper = new ClusterStorageAddHelper(this.$());
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
          });
      }
    );
  });
});
