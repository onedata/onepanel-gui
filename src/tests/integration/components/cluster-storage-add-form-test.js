import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

import GenericFields from 'onepanel-gui/utils/cluster-storage/generic-fields';
import PosixFields from 'onepanel-gui/utils/cluster-storage/posix-fields';

class ClusterStorageAddHelper {
  constructor($template) {
    this.$template = $template;
    this.$form = $template.find('.cluster-storage-add-form form');
  }

  /**
   * @param {string} fieldName
   * @return {string}
   */
  _getInputId(fieldName) {
    return `${this.$form.attr('id')}-${fieldName}`;
  }

  /**
   * @param {string} fieldName
   * @return {JQuery}
   */
  getInput(fieldName) {
    return this.$template.find('#' + this._getInputId(fieldName));
  }
}

describe('Integration | Component | cluster storage add form', function () {
  setupComponentTest('cluster-storage-add-form', {
    integration: true
  });

  it('renders fields for POSIX storage type if "posix" is injected', function () {
    let totalFields = Object.keys(GenericFields).length + Object.keys(PosixFields)
      .length;

    this.set('selectedStorageType', {
      id: 'posix',
      name: 'POSIX'
    });

    this.render(hbs `{{cluster-storage-add-form selectedStorageType=selectedStorageType}}`);

    let helper = new ClusterStorageAddHelper(this.$());

    // TODO use chai-jquery, chai-dom or something    
    expect(this.$('input')).to.have.length(totalFields);
    ['name', 'mountPoint', 'timeout'].forEach(fieldName => {
      expect(helper.getInput(fieldName)).to.have.length(1);
      expect(helper.getInput(fieldName)[0].tagName).to.be.equal('INPUT');
    });
  });

  it('does not submit empty values for posix', function (done) {
    this.set('selectedStorageType', {
      id: 'posix',
      name: 'POSIX'
    });

    this.render(hbs `
      {{cluster-storage-add-form
        selectedStorageType=selectedStorageType
        submit=submit
      }}
    `);

    let handleSubmit = function (formData) {
      expect(formData).to.have.property('name');
      expect(formData.name).to.be.equal('some name');
      expect(formData).to.have.property('mountPoint');
      expect(formData.mountPoint).to.be.equal('/mnt/st1');
      expect(formData).to.not.have.property('timeout');
      expect(formData).to.not.have.property('readonly');
      done();
    };

    this.set('selectedStorageType', {
      id: 'posix',
      name: 'POSIX'
    });
    this.set('submit', handleSubmit);

    let helper = new ClusterStorageAddHelper(this.$());

    helper.getInput('name').val('some name').change();
    helper.getInput('mountPoint').val('/mnt/st1').change();
    this.$('button[type=submit]').click();
  });
});
