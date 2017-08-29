import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import SpaceDetails from 'onepanel-gui/models/space-details';

import bytesToString from 'onedata-gui-common/utils/bytes-to-string';
const b2s = (bytes) => bytesToString(bytes, { iecFormat: true });

describe('Integration | Component | storage item/supported spaces/item', function () {
  setupComponentTest('storage-item/supported-spaces/item', {
    integration: true,
  });

  it('renders human readable size', function () {
    let providerId = '123';

    this.set('providerId', providerId);

    this.set('space', SpaceDetails.create({
      id: 'space1',
      name: 'Space One',
      storageId: 'storage1',
      supportingProviders: {
        [providerId]: 100000,
      },
    }));

    this.render(hbs `{{storage-item/supported-spaces/item
      providerId=providerId
      space=space}}
    `);

    expect(this.$().html()).to.match(
      new RegExp(`Space One[\\s\\S]*${b2s(100000).replace('.', '\\.')}`)
    );
  });
});
