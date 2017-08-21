import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

import storageManager from 'onepanel-gui/services/storage-manager';
import onepanelServer from 'ember-onedata-onepanel-server/services/onepanel-server-mock';
import globalNotifyStub from '../../helpers/global-notify-stub';

// NOTE: this test uses main real storage manager that uses onepanelServer mock

describe('Integration | Component | manage cluster storages', function () {
  setupComponentTest('manage-cluster-storages', {
    integration: true,
  });

  beforeEach(function () {
    this.register('service:onepanel-server', onepanelServer);
    this.inject.service('onepanel-server', { as: 'onepanelServer' });

    this.register('service:storage-manager', storageManager);
    this.inject.service('storage-manager', { as: 'storageManager' });

    this.register('service:global-notify', globalNotifyStub);
    this.inject.service('global-notify', { as: 'globalNotify' });
  });

  it('fetches and shows storages on init', function (done) {
    let onepanelServer = this.container.lookup('service:onepanel-server');
    onepanelServer.set('__storages', [{
      id: 's1',
      name: 'First',
      type: 'POSIX',
      mountPoint: '/mnt/s1',
    }]);

    this.render(hbs `{{manage-cluster-storages}}`);

    wait().then(() => {
      expect(this.$('.storage-item'), 'only one storage item')
        .to.have.length(1);
      expect(this.$('.storage-item').text())
        .to.match(new RegExp('First'));
      done();
    });
  });
});
