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

  it('invokes syncIntervalChanged injected function on syncInterval change',
    function (done) {
      const syncIntervalChanged = sinon.spy();
      this.on('syncIntervalChanged', syncIntervalChanged);

      this.render(hbs `{{space-storage-import
        importEnabled=true
        syncIntervalChanged=(action "syncIntervalChanged")
      }}`);

      this.$('.btn-sync-interval-day').click();

      wait().then(() => {
        expect(syncIntervalChanged).to.be.calledOnce;
        expect(syncIntervalChanged).to.be.calledWith('day');
        done();
      });
    });
});
