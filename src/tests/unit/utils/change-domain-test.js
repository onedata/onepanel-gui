import { expect } from 'chai';
import { describe, it } from 'mocha';
import changeDomain from 'onepanel-gui/utils/change-domain';
import sinon from 'sinon';

describe('Unit | Utility | change domain', function () {
  it('makes few request to changed URL until the tryGet resolves', function () {
    let getCount = 0;
    const tryGet = function tryGet() {
      getCount += 1;
      return getCount >= 3 ? Promise.resolve('data') : Promise.reject();
    };
    const tryGetSpy = sinon.spy(tryGet);
    const mockLocation = {
      reload() {},
      hostname: 'current.com',
      toString() {
        return `https://${this.hostname}/#/hello`;
      },
    };

    return changeDomain('example.com', {
      location: mockLocation,
      tryGet: tryGetSpy,
      tryCount: 10,
      tryInterval: 1,
    }).then(() => {
      expect(tryGetSpy).to.be.calledWith('https://example.com/#/hello');
      expect(tryGetSpy.callCount).to.equal(3);
      expect(mockLocation.hostname).to.equal('example.com');
    });
  });

  it('rejects if few requests are rejecting', function () {
    const tryGet = function tryGet() {
      return Promise.reject();
    };
    const tryGetSpy = sinon.spy(tryGet);
    const mockLocation = {
      reload() {},
      hostname: 'current.com',
      toString() {
        return `https://${this.hostname}/#/hello`;
      },
    };
    const tryCount = 10;

    return changeDomain('example.com', {
        location: mockLocation,
        tryGet: tryGetSpy,
        tryCount,
        tryInterval: 1,
      })
      .then(() => true)
      .catch(() => false)
      .then(result => {
        expect(result, 'the promise should reject').to.be.false;
        expect(tryGetSpy.callCount).to.equal(tryCount);
      });
  });
});
