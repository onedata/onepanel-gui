import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import wait from 'ember-test-helpers/wait';
import Ember from 'ember';

import onepanelServerStub from '../../helpers/onepanel-server-stub';

const {
  RSVP: { Promise },
} = Ember;

describe('Unit | Service | storage manager', function () {
  setupTest('service:storage-manager', {
    // Specify the other units that are required for this test.
    // needs: ['service:foo']
  });

  beforeEach(function () {
    this.register('service:onepanel-server', onepanelServerStub);
    this.inject.service('onepanel-server', { as: 'onepanelServer' });
  });

  it('can return single storage promise proxy', function (done) {
    const SOME_ID = 'some_id_1';

    let onepanelServer = this.container.lookup('service:onepanelServer');
    onepanelServer.request = function (service, method, ...params) {
      if (service === 'oneprovider') {
        if (method === 'getStorageDetails') {
          if (params[0] === SOME_ID) {
            return new Promise(resolve => resolve({
              data: {
                name: 'FirstStorage',
                type: 'POSIX',
                mountPoint: '/mnt/st1'
              }
            }));
          }
        }
      }
    };

    let service = this.subject();

    let storageProxy = service.getStorageDetails(SOME_ID);

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

    let onepanelServer = this.container.lookup('service:onepanelServer');
    onepanelServer.request = function (service, method, ...params) {
      if (service === 'oneprovider') {
        if (method === 'getStorageDetails') {
          if (params[0] === SOME_ID) {
            return new Promise(resolve => resolve({
              data: {
                name: 'FirstStorage',
                type: 'POSIX',
                mountPoint: '/mnt/st1'
              }
            }));
          }
        }
      }
    };

    let service = this.subject();

    let storageProxy1 = service.getStorageDetails(SOME_ID);
    storageProxy1.get('promise').then(() => {
      let storageProxy2 = service.getStorageDetails(SOME_ID);
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
