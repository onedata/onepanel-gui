import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import onepanelServerStub from '../../helpers/onepanel-server-stub';

describe('Unit | Service | user manager', function () {
  setupTest('service:user-manager', {
    // a onepanelServer is mocked in beforeEach
    // needs: ['service:onepanelServer']
  });

  beforeEach(function () {
    this.register('service:onepanel-server', onepanelServerStub);
    this.inject.service('onepanel-server', { as: 'onepanelServer' });
  });

  it('gets user details of current user if asked', function () {
    let service = this.subject();
    let onepanelServer = this.container.lookup('service:onepanelServer');
    let currentUsername = 'some_user_1';
    let currentUserProxy = { some: 'proxy' };
    onepanelServer.set('username', currentUsername);
    service.getUserDetails = function (username) {
      expect(username).to.be.equal(currentUsername);
      return currentUserProxy;
    };

    let currentUserResult = service.getCurrentUser();

    expect(currentUserResult).to.be.equal(currentUserProxy);
  });

  it('resolves list with only current user details', function (done) {
    let service = this.subject();
    let currentUserProxy = { some: 'proxy' };
    service.getCurrentUser = function () {
      return currentUserProxy;
    };

    service.getUsers().get('promise').then(users => {
      expect(users).to.have.length(1);
      expect(users[0]).to.be.equal(currentUserProxy);
      done();
    });
  });
});
