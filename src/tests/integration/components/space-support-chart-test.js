import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import _ from 'lodash';
import wait from 'ember-test-helpers/wait';
import b2s from 'onedata-gui-common/utils/bytes-to-string';

describe('Integration | Component | space support chart', function () {
  setupComponentTest('space-support-chart', {
    integration: true,
  });

  it('renders total support size', function (done) {
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

    wait().then(() => {
      expect(this.$('.ct-centered-text'))
        .to.contain(b2s(totalSize, { iecFormat: true }));
      done();
    });
  });
});
