import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { registerService, lookupService } from '../../helpers/stub-service';
import sinon from 'sinon';

import spaceManagerStub from '../../helpers/space-manager-stub';

describe('Integration | Component | space auto cleaning', function () {
  setupComponentTest('space-auto-cleaning', {
    integration: true,
  });

  beforeEach(function () {
    registerService(this, 'space-manager', spaceManagerStub);
  });

  it('does not render cleaning settings row if is not enabled', function () {
    const spaceManager = lookupService(this, 'space-manager');
    sinon.stub(spaceManager, 'getAutoCleaningReports').resolves([]);

    const spaceId = 'a';
    const autoCleaning = {
      enabled: false,
    };
    this.setProperties({
      spaceId,
      autoCleaning,
    });
    this.render(hbs `<div class="col-content">
      {{space-auto-cleaning
        spaceId=spaceId
        autoCleaning=autoCleaning
      }}
    </div>`);

    expect(this.$('.space-cleaning-settings')).to.not.exist;
  });
});
