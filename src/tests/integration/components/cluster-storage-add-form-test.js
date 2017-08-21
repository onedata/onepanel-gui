import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import wait from 'ember-test-helpers/wait';
import hbs from 'htmlbars-inline-precompile';

import FormHelper from '../../helpers/form';

import GenericFields from 'onepanel-gui/utils/cluster-storage/generic-fields';
import PosixFields from 'onepanel-gui/utils/cluster-storage/posix-fields';

class ClusterStorageAddHelper extends FormHelper {
  constructor($template) {
    super($template, '.cluster-storage-add-form');
  }
}

describe('Integration | Component | cluster storage add form', function () {
  setupComponentTest('cluster-storage-add-form', {
    integration: true,
  });

  it('renders fields for POSIX storage type if "posix" is injected', function () {
    let totalFields = Object.keys(GenericFields).length + Object.keys(PosixFields)
      .length;

    this.set('selectedStorageType', {
      id: 'posix',
      name: 'POSIX',
    });

    this.render(hbs `{{cluster-storage-add-form selectedStorageType=selectedStorageType}}`);

    let helper = new ClusterStorageAddHelper(this.$());

    // TODO use chai-jquery, chai-dom or something    
    expect(this.$('input')).to.have.length(totalFields);
    ['generic-name', 'posix-mountPoint', 'posix-timeout'].forEach(fieldName => {
      expect(helper.getInput(fieldName)).to.have.length(1);
      expect(helper.getInput(fieldName)[0].tagName).to.be.equal('INPUT');
    });
  });

  it('does not submit empty values for posix', function (done) {
    this.set('selectedStorageType', {
      id: 'posix',
      name: 'POSIX',
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
      name: 'POSIX',
    });
    this.set('submit', handleSubmit);

    let helper = new ClusterStorageAddHelper(this.$());

    helper.getInput('generic-name').val('some name').change();
    helper.getInput('posix-mountPoint').val('/mnt/st1').change();
    wait().then(() => helper.submit());
  });
});
