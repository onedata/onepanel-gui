import { expect } from 'chai';
import { describe, it } from 'mocha';
import changeDomain from 'onepanel-gui/utils/change-domain';

describe('Unit | Utility | change domain', function () {
  it('changes the location after timeout', function () {
    const mockLocation = {
      reload() {},
      hostname: 'current.com',
      toString() {
        return `https://${this.hostname}/#/hello`;
      },
    };
    const delay = 10;
    return changeDomain('example.com', {
      location: mockLocation,
      delay,
    }).then(() => {
      expect(mockLocation.hostname).to.equal('example.com');
    });
  });
});
