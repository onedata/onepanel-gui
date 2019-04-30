import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import onepanelServerStub from '../../helpers/onepanel-server-stub';
import { resolve } from 'rsvp';
import { get, getProperties } from '@ember/object';
import { registerService, lookupService } from '../../helpers/stub-service';

describe('Unit | Service | user manager', function () {
  setupTest('service:user-manager', {
    // a onepanelServer is mocked in beforeEach
    // needs: ['service:onepanelServer']
  });

  beforeEach(function () {
    registerService(this, 'onepanelServer', onepanelServerStub);
  });

  it('gets current user', function () {
    const currentUser = {
      userId: 'root',
      username: 'root',
      clusterPrivileges: ['some_privilege'],
    };
    const onepanelServer = lookupService(this, 'onepanelServer');
    onepanelServer.set('userPromise', resolve(currentUser));

    const service = this.subject();
    const currentUserResult = service.getCurrentUser();
    return currentUserResult.then(user => {
      const userBasicProps = getProperties(
        user,
        'userId',
        'username',
        'clusterPrivileges'
      );
      expect(userBasicProps).to.deep.equal(currentUser);
      expect(get(user, 'id')).to.equal(get(currentUser, 'username'));
      expect(get(user, 'name')).to.equal(get(currentUser, 'username'));
    });
  });
});
