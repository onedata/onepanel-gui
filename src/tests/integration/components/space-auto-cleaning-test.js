import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { registerService } from '../../helpers/stub-service';

import spaceManagerStub from '../../helpers/space-manager-stub';

describe('Integration | Component | space auto cleaning', function () {
  setupComponentTest('space-auto-cleaning', {
    integration: true,
  });

  beforeEach(function () {
    registerService(this, 'space-manager', spaceManagerStub);
  });

  it('does not render cleaning settings row if is not enabled', function () {
    const spaceId = 'a';
    const autoCleaning = {
      enabled: false,
    };
    this.setProperties({
      spaceId,
      autoCleaning,
    });
    this.render(hbs `{{space-auto-cleaning
      spaceId=spaceId
      autoCleaning=autoCleaning
    }}`);

    expect(this.$('.space-cleaning-settings')).to.not.exist;
  });

  // FIXME: this test does not fail itself, but causes some following tests to fail
  // it('calls getAutoCleaningReports if auto cleaning is enabled', function (done) {
  //   const spaceId = 'a';
  //   const settings = {
  //     fileSizeGreaterThan: 1,
  //     fileSizeLesserThan: 1,
  //     fileTimeNotActive: 1,
  //     spaceSoftQuota: 1,
  //     spaceHardQuota: 1,
  //   };
  //   const autoCleaning = {
  //     enabled: true,
  //     settings,
  //   };
  //   const spaceSize = 1000;
  //   const status = {
  //     isWorking: true,
  //     spaceUsed: 500,
  //   };
  //   const reports = [];
  //   this.setProperties({
  //     spaceId,
  //     spaceSize,
  //     autoCleaning,
  //   });
  //   const spaceManagerStub = lookupService(this, 'space-manager');
  //   const getStatus = sinon.stub(spaceManagerStub, 'getAutoCleaningStatus');
  //   getStatus.resolves(status);
  //   sinon.stub(spaceManagerStub, 'getAutoCleaningReports').resolves(reports);

  //   this.render(hbs `{{space-auto-cleaning
  //     spaceId=spaceId
  //     spaceSize=spaceSize
  //     autoCleaning=autoCleaning
  //   }}`);

  //   wait().then(() => {
  //     expect(getStatus).to.be.called.atLeastOnce;
  //     done();
  //   });
  // });
});
