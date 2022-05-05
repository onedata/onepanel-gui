import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

import sinon from 'sinon';

describe('Integration | Component | space storage import', function () {
  setupRenderingTest();

  it('invokes importIntervalChanged injected function on importInterval change',
    async function (done) {
      const importIntervalChanged = sinon.spy();
      this.set('importIntervalChanged', importIntervalChanged);

      await render(hbs `{{space-storage-import
        importEnabled=true
        importIntervalChanged=(action importIntervalChanged)
      }}`);

      await click('.btn-import-interval-day');

      wait().then(() => {
        expect(importIntervalChanged).to.be.calledOnce;
        expect(importIntervalChanged).to.be.calledWith('day');
        done();
      });
    });
});
