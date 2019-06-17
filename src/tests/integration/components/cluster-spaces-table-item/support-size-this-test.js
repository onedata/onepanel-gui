import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe(
  'Integration | Component | cluster spaces table item/support size this',
  function () {
    setupComponentTest('cluster-spaces-table-item/support-size-this', {
      integration: true,
    });

    it('renders support size value', function () {
      this.set('providerSupportSize', 2 * Math.pow(1024, 2));
      this.render(hbs `{{cluster-spaces-table-item/support-size-this
        providerSupportSize=providerSupportSize
        spaceOccupancy=0
      }}`);
      expect(this.$().text()).to.match(/2 MiB/);
    });
  }
);
