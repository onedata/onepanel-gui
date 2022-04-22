import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe(
  'Integration | Component | cluster spaces table item/support size this',
  function () {
    setupRenderingTest();

    it('renders support size value', async function() {
      this.set('providerSupportSize', 2 * Math.pow(1024, 2));
      await render(hbs `{{cluster-spaces-table-item/support-size-this
        providerSupportSize=providerSupportSize
        spaceOccupancy=0
      }}`);
      expect(this.$().text()).to.match(/2 MiB/);
    });
  }
);
