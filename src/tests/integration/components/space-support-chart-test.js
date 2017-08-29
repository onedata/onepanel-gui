import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import _ from 'lodash';
import b2s from 'onedata-gui-common/utils/bytes-to-string';

describe('Integration | Component | space support chart', function () {
  setupComponentTest('space-support-chart', {
    integration: true,
  });

  it('renders total support size', function () {
    let spaceSupporters = [{
        providerId: 'id1',
        name: 'Pro1',
        size: 10000,
      },
      {
        providerId: 'id2',
        name: 'Pro2',
        size: 30000,
      },
    ];
    const totalSize = _.sum(_.map(spaceSupporters, 'size'));
    this.set('spaceSupporters', spaceSupporters);

    this.render(hbs `{{space-support-chart spaceSupporters=spaceSupporters}}`);
    expect(
      this.$('.total-size')).to.contain(b2s(totalSize, { iecFormat: true }));
  });
});
