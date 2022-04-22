import { Promise } from 'rsvp';
import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import wait from 'ember-test-helpers/wait';
import { registerService, lookupService } from '../../helpers/stub-service';

import onepanelServerStub from '../../helpers/onepanel-server-stub';

describe('Unit | Service | storage manager', function () {
  setupTest();

  beforeEach(function () {
    this.onepanelServer = registerService(this, 'onepanel-server', onepanelServerStub);
  });

  it('can return single storage promise proxy', function (done) {
    const SOME_ID = 'some_id_1';

    this.onepanelServer.requestValidData = function (api, method, ...params) {
      if (api === 'StoragesApi') {
        if (method === 'getStorageDetails') {
          if (params[0] === SOME_ID) {
            return new Promise(resolve => resolve({
              data: {
                name: 'FirstStorage',
                type: 'POSIX',
                mountPoint: '/mnt/st1',
              },
            }));
          }
        }
      }
    };

    const service = lookupService(this, 'storage-manager');

    const storageProxy = service.getStorageDetails(SOME_ID);

    wait().then(() => {
      storageProxy.get('promise').then(data => {
        expect(data.get('name')).to.be.equal('FirstStorage');
        expect(data.get('type')).to.be.equal('POSIX');
        expect(data.get('mountPoint')).to.be.equal('/mnt/st1');
        done();
      });
    });
  });

  it('can return the same record proxy when using cache', function (done) {
    const SOME_ID = 'some_id_2';

    this.onepanelServer.requestValidData = function (api, method, ...params) {
      if (api === 'StoragesApi') {
        if (method === 'getStorageDetails') {
          if (params[0] === SOME_ID) {
            return new Promise(resolve => resolve({
              data: {
                name: 'FirstStorage',
                type: 'POSIX',
                mountPoint: '/mnt/st1',
              },
            }));
          }
        }
      }
    };

    const service = lookupService(this, 'storage-manager');

    const storageProxy1 = service.getStorageDetails(SOME_ID);
    storageProxy1.get('promise').then(() => {
      const storageProxy2 = service.getStorageDetails(SOME_ID);
      storageProxy2.get('promise').then(data => {
        expect(storageProxy1.get('content'))
          .to.be.equal(storageProxy2.get('content'));
        expect(data.get('name')).to.be.equal('FirstStorage');
        expect(data.get('type')).to.be.equal('POSIX');
        expect(data.get('mountPoint')).to.be.equal('/mnt/st1');
        done();
      });
    });
  });
});
