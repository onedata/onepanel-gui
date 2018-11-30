import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import wait from 'ember-test-helpers/wait';
import hbs from 'htmlbars-inline-precompile';
import _ from 'lodash';

import FormHelper from '../../helpers/form';

import GenericFields from 'onepanel-gui/utils/cluster-storage/generic-fields';
import PosixFields from 'onepanel-gui/utils/cluster-storage/posix-fields';
import LumaFields from 'onepanel-gui/utils/cluster-storage/luma-fields';

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
  mountPoint: '/mnt/st1',
  lumaEnabled: true,
  lumaUrl: 'http://some.url.com',
  lumaApiKey: 'someapikey',
  timeout: 20,
  readonly: true,
  name: 'Some storage',
};

describe('Integration | Component | cluster storage add form', function () {
  this.timeout(4000);

  setupComponentTest('cluster-storage-add-form', {
    integration: true,
  });

  it('[show] shows storage details', function () {
    this.set('storage', POSIX_STORAGE);
    this.render(hbs `{{cluster-storage-add-form storage=storage mode="show"}}`);

    const helper = new ClusterStorageAddHelper(this.$());

    return wait().then(() => {
      // +1 because of 'type' field
      expect(this.$('.form-group')).to.have.length(
        GenericFields.length + PosixFields.length + LumaFields.length + 1
      );
      expect(helper.getInput('type_static-type').text()).to.contain('POSIX');
      [
        'generic_static-name',
        'luma_static-lumaUrl',
        'luma_static-lumaApiKey',
        'posix_static-mountPoint',
        'posix_static-timeout',
      ].forEach((fieldName) => {
        expect(helper.getInput(fieldName).text())
          .to.contain(POSIX_STORAGE[fieldName.split('-').pop()]);
      });
      [
        'generic_static-lumaEnabled',
        'posix_static-readonly',
      ].forEach((fieldName) => {
        expect(
          helper.getInput(fieldName).find('.one-way-toggle')
          .hasClass('checked')
        ).to.be.equal(POSIX_STORAGE[fieldName.split('-').pop()]);
      });
    });
  });

  it('[create] renders fields for POSIX storage type if "posix" is selected',
    function () {
      // +1 because of 'type' field
      const totalFields = Object.keys(GenericFields).length +
        Object.keys(PosixFields).length + 1;

      this.set('selectedStorageType', POSIX_TYPE);
      this.render(hbs `{{cluster-storage-add-form selectedStorageType=selectedStorageType}}`);

      const helper = new ClusterStorageAddHelper(this.$());
      return wait().then(() => {
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
        [
          'generic-lumaEnabled',
          'posix-readonly',
        ].forEach(fieldName => {
          expect(helper.getToggleInput(fieldName)).to.exist;
          expect(helper.getToggleInput(fieldName).find('input')).to.exist;
        });
      });
    }
  );

  it('[create] does not submit empty values for posix', function () {
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
        expect(formData).to.have.property('lumaEnabled');
        expect(formData.lumaEnabled).to.be.false;
        expect(formData).to.have.property('mountPoint');
        expect(formData.mountPoint).to.be.equal('/mnt/st1');
        expect(formData).to.not.have.property('timeout');
        expect(formData).to.not.have.property('readonly');
        return Promise.resolve();
      },
    });

    this.render(hbs `
      {{cluster-storage-add-form
        selectedStorageType=selectedStorageType
        submit=submit
      }}
    `);

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

  it('[create] shows and hides luma fields', function () {
    this.render(hbs `{{cluster-storage-add-form}}`);

    const lumaSelector = '[class*="field-luma"]';
    const helper = new ClusterStorageAddHelper(this.$());
    const lumaEnabledToggle = helper.getToggleInput('generic-lumaEnabled');

    let lumaFields = this.$(lumaSelector);
    expect(lumaFields).to.have.length(0);
    lumaEnabledToggle.click();
    return wait().then(() => {
      lumaFields = this.$(lumaSelector);
      expect(lumaFields).to.have.length(2);
      expect(lumaFields.parents('.form-group')).to.have.class('fadeIn');
      lumaEnabledToggle.click();
      return wait().then(() => {
        lumaFields = this.$(lumaSelector);
        expect(lumaFields).to.have.length(2);
        expect(lumaFields.parents('.form-group')).to.have.class('fadeOut');
      });
    });
  });

  it('[create] resets fields values after storage type change', function () {
    this.set('selectedStorageType', POSIX_TYPE);
    this.render(hbs `{{cluster-storage-add-form selectedStorageType=selectedStorageType}}`);

    const helper = new ClusterStorageAddHelper(this.$());

    helper.getInput('generic-name').val('sometext').change();
    helper.getToggleInput('generic-lumaEnabled').click();
    return wait().then(() => {
      helper.getInput('luma-lumaUrl').val('sometext2').change();
      return wait().then(() => {
        this.set('selectedStorageType', S3_TYPE);
        return wait().then(() => {
          helper.getToggleInput('generic-lumaEnabled').click();
          return wait().then(() => {
            expect(helper.getInput('generic-name').val()).to.be.empty;
            expect(helper.getInput('luma-lumaUrl').val()).to.be.empty;
          });
        });
      });
    });
  });

  it('[create] resets fields values after change to another type and come back',
    function () {

      this.set('selectedStorageType', POSIX_TYPE);
      this.render(hbs `{{cluster-storage-add-form selectedStorageType=selectedStorageType}}`);

      const helper = new ClusterStorageAddHelper(this.$());

      return wait().then(() => {
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

  it('[create] resets fields values after form visibility toggle', function () {
    this.set('isFormOpened', true);
    this.render(hbs `{{cluster-storage-add-form isFormOpened=isFormOpened}}`);

    const helper = new ClusterStorageAddHelper(this.$());

    helper.getInput('generic-name').val('name').change();
    helper.getToggleInput('generic-lumaEnabled').click();
    return wait().then(() => {
      this.set('isFormOpened', false);
      return wait().then(() => {
        this.set('isFormOpened', true);
        return wait().then(() => {
          expect(helper.getInput('generic-name').val()).to.be.empty;
          expect(this.$('[class*="field-luma"]')).to.have.length(0);
        });
      });
    });
  });

  it('[edit] shows storage details', function () {
    this.set('storage', POSIX_STORAGE);
    this.render(hbs `
      {{cluster-storage-add-form
        storage=storage 
        mode="edit"}}
    `);

    const helper = new ClusterStorageAddHelper(this.$());

    return wait().then(() => {
      // +2 because of 'type' field and submit button row
      expect(this.$('.form-group')).to.have.length(
        GenericFields.length + PosixFields.length + LumaFields.length + 2
      );
      expect(helper.getInput('type_static-type').text()).to.contain('POSIX');
      [
        'generic_editor-name',
        'luma_editor-lumaUrl',
        'luma_editor-lumaApiKey',
        'posix_editor-timeout',
        'posix_editor-mountPoint',
      ].forEach((fieldName) => {
        expect(helper.getInput(fieldName).val())
          .to.be.equal(String(POSIX_STORAGE[fieldName.split('-').pop()]));
      });
      expect(
        helper.getInput('generic_editor-lumaEnabled')
        .find('.one-way-toggle').hasClass('checked')
      ).to.be.equal(POSIX_STORAGE['lumaEnabled']);
      expect(
        helper.getToggleInput('posix_editor-readonly').hasClass('checked')
      ).to.be.equal(POSIX_STORAGE['readonly']);
    });
  });

  it('[edit] luma enabled toggle does not change luma fields values', function () {
    this.set('storage', POSIX_STORAGE);
    this.render(hbs `
      {{cluster-storage-add-form
        storage=storage 
        mode="edit"}}
    `);

    const helper = new ClusterStorageAddHelper(this.$());

    return wait().then(() => {
      helper.getToggleInput('generic_editor-lumaEnabled').click();
      return wait().then(() => {
        helper.getToggleInput('generic_editor-lumaEnabled').click();
        return wait().then(() => {
          expect(helper.getInput('type_static-type').text())
            .to.contain('POSIX');
          [
            'luma_editor-lumaUrl',
            'luma_editor-lumaApiKey',
          ].forEach((fieldName) => {
            expect(helper.getInput(fieldName).val()).to.be.equal(
              String(POSIX_STORAGE[fieldName.split('-').pop()])
            );
          });
        });
      });
    });
  });

  it('[edit] submits only changed data', function () {
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

    const helper = new ClusterStorageAddHelper(this.$());

    return wait().then(() => {
      helper.getInput('generic_editor-name').val(storageName).change();
      helper.getInput('posix_editor-mountPoint').val('someMountPoint').change();
      return wait().then(() => {
        helper.getInput('posix_editor-mountPoint')
          .val(POSIX_STORAGE.mountPoint).change();
        return wait().then(() => {
          helper.submit();
          expect(submitOccurred).to.be.true;
        });
      });
    });
  });

  it('[edit] submits null value for cleared out optional fields', function () {
    let submitOccurred = false;
    this.set('submit', (formData) => {
      submitOccurred = true;
      expect(_.keys(formData)).to.have.length(2);
      expect(formData.lumaApiKey).to.be.null;
      return Promise.resolve();
    });

    this.set('storage', POSIX_STORAGE);
    this.render(hbs `
      {{cluster-storage-add-form
        storage=storage 
        mode="edit"
        submit=submit}}
    `);

    const helper = new ClusterStorageAddHelper(this.$());

    return wait().then(() => {
      helper.getInput('luma_editor-lumaApiKey').val('').change();
      return wait().then(() => {
        helper.submit();
        expect(submitOccurred).to.be.true;
      });
    });
  });

  it('[edit] does not remember editor values while edit -> show -> edit cycle',
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

      let helper = new ClusterStorageAddHelper(this.$());

      return wait().then(() => {
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
});
