import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

import sinon from 'sinon';

describe('Integration | Component | space storage import', function () {
  setupComponentTest('space-storage-import', {
    integration: true,
  });

  it('invokes importIntervalChanged injected function on importInterval change',
    function (done) {
      const importIntervalChanged = sinon.spy();
      this.on('importIntervalChanged', importIntervalChanged);

      this.render(hbs `{{space-storage-import
        importEnabled=true
        importIntervalChanged=(action "importIntervalChanged")
      }}`);

      this.$('.btn-import-interval-day').click();

      wait().then(() => {
        expect(importIntervalChanged).to.be.calledOnce;
        expect(importIntervalChanged).to.be.calledWith('day');
        done();
      });
    });
});
