import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import { get, set } from '@ember/object';
import wait from 'ember-test-helpers/wait';
import { registerService, lookupService } from '../../helpers/stub-service';
import Service from '@ember/service';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';

const I18n = Service.extend({
  t() {
    return 'hello';
  },
});

const DnsManager = Service.extend({
  getDnsCheckProxy() {
    return PromiseObject.create({});
  },
});

describe('Unit | Component | sidebar clusters', function () {
  setupComponentTest('sidebar-clusters', {
    needs: [
      'service:events-bus',
      'service:navigation-state',
      'service:onepanel-server',
      'component:empty-collection-sidebar',
      'helper:tt',
    ],
    unit: true,
  });

  beforeEach(function () {
    registerService(this, 'dnsManager', DnsManager);
    registerService(this, 'i18n', I18n);
  });

  // FIXME: reimplement test
  it('changes dns warning status after change of dnsValid', function () {
    const dnsManager = lookupService(this, 'dnsManager');
    set(dnsManager, 'dnsValid', undefined);

    const component = this.subject({
      onepanelServer: undefined,
      dnsManager,
      onepanelServiceType: 'zone',
      cluster: { isInitialized: true },
    });

    const getDnsItem = () => component.get('secondLevelItems').findBy('id', 'dns');

    this.render();

    const dnsItem = getDnsItem();
    expect(dnsItem).to.be.ok;
    expect(get(dnsItem, 'warningMessage')).to.be.empty;
    set(dnsManager, 'dnsValid', false);
    return wait().then(() => {
      expect(get(getDnsItem(), 'warningMessage')).to.be.not.empty;
    });
  });
});
