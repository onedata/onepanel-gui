import { expect } from 'chai';
import { describe, it } from 'mocha';
import changeDomain from 'onepanel-gui/utils/change-domain';
import globals from 'onedata-gui-common/utils/globals';

describe('Unit | Utility | change-domain', function () {
  it('changes the location after timeout', function () {
    globals.mock('location', {
      reload() {},
      hostname: 'current.com',
      toString() {
        return `https://${this.hostname}/#/hello`;
      },
    });
    const delay = 10;
    return changeDomain('example.com', {
      delay,
    }).then(() => {
      expect(globals.location.hostname).to.equal('example.com');
    });
  });
});
