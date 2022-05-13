import { Promise } from 'rsvp';
import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import { registerService, lookupService } from '../../helpers/stub-service';

import onepanelServerStub from '../../helpers/onepanel-server-stub';

describe('Unit | Service | storage manager', function () {
  setupTest();

  beforeEach(function () {
    this.onepanelServer = registerService(this, 'onepanel-server', onepanelServerStub);
  });

  it('can return single storage promise proxy', async function () {
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
    const storageProxyData = await storageProxy.get('promise');
    expect(storageProxyData.get('name')).to.be.equal('FirstStorage');
    expect(storageProxyData.get('type')).to.be.equal('POSIX');
    expect(storageProxyData.get('mountPoint')).to.be.equal('/mnt/st1');
  });

  it('can return the same record proxy when using cache', async function () {
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
    await storageProxy1.get('promise');
    const storageProxy2 = service.getStorageDetails(SOME_ID);
    const storageProxy2Data = await storageProxy2.get('promise');
    expect(storageProxy1.get('content'))
      .to.be.equal(storageProxy2.get('content'));
    expect(storageProxy2Data.get('name')).to.be.equal('FirstStorage');
    expect(storageProxy2Data.get('type')).to.be.equal('POSIX');
    expect(storageProxy2Data.get('mountPoint')).to.be.equal('/mnt/st1');
  });
});
