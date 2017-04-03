import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

import GenericFields from 'onepanel-gui/utils/cluster-storage/generic-fields';
import PosixFields from 'onepanel-gui/utils/cluster-storage/posix-fields';

describe('Integration | Component | cluster storage add form', function () {
  setupComponentTest('cluster-storage-add-form', {
    integration: true
  });

  it('renders fields for POSIX storage type if "posix" is injected', function () {
    let totalFields = Object.keys(GenericFields).length + Object.keys(PosixFields).length;

    this.set('selectedStorageType', {
      id: 'posix',
      name: 'POSIX'
    });

    this.render(hbs `{{cluster-storage-add-form selectedStorageType=selectedStorageType}}`);

    // TODO use chai-jquery, chai-dom or something    
    expect(this.$('input')).to.have.length(totalFields);
  });

  it('does not submit empty values for posix', function (done) {
    this.set('selectedStorageType', {
      id: 'posix',
      name: 'POSIX'
    });

    this.render(hbs `{{cluster-storage-add-form selectedStorageType=selectedStorageType}}`);

    let handleSubmit = function (formData) {
      expect(formData).to.have.property('mountPoint');
      expect(formData).to.not.have.property('timeout');
      expect(formData).to.not.have.property('readonly');
      done();
    };

    this.set('selectedStorageType');
    this.set('submit', handleSubmit);

    this.render(hbs `{{cluster-storage-add-form}}`);
    let $form = this.$('.cluster-storage-add-form form');
    let getInputId = function (fieldName) {
      return `${$form.attr('id')}-${fieldName}`;
    };

    this.$('#' + getInputId('name')).val('some name');
    this.$('#' + getInputId('mountPoint')).val('/mnt/st1');

    this.$('button[type=submit]').click();
  });
});
