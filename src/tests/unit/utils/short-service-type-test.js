import { expect } from 'chai';
import { describe, it } from 'mocha';
import shortServiceType from 'onepanel-gui/utils/short-service-type';

describe('Unit | Utility | short-service-type', function () {
  it('converts onezone to zone', function () {
    const result = shortServiceType('onezone');
    expect(result).to.be.equal('zone');
  });

  it('converts oneprovider to provider', function () {
    const result = shortServiceType('oneprovider');
    expect(result).to.be.equal('provider');
  });
});
