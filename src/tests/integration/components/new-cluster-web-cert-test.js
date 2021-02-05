import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import { registerService, lookupService } from '../../helpers/stub-service';
import wait from 'ember-test-helpers/wait';
import sinon from 'sinon';
import Service from '@ember/service';
import { click } from 'ember-native-dom-helpers';
import { resolve } from 'rsvp';
import { set } from '@ember/object';

const DeploymentManager = Service.extend({
  getClusterConfiguration() {
    return resolve({
      data: {
        onezone: {
          domainName: 'onezone.org',
        },
      },
    });
  },
});

const ProviderManager = Service.extend({
  getProviderDetailsProxy() {
    return promiseObject(resolve({
      domain: 'somedomain.onezone.org',
    }));
  },
});

const reloadDelay = 5000;

describe('Integration | Component | new cluster web cert', function () {
  setupComponentTest('new-cluster-web-cert', {
    integration: true,
  });

  beforeEach(function () {
    const _location = {
      reload: sinon.spy(),
      hostname: '127.0.0.1',
    };

    registerService(this, 'deployment-manager', DeploymentManager);
    registerService(this, 'provider-manager', ProviderManager);
    registerService(this, 'gui-utils', Service);
    registerService(this, 'onepanel-server', Service);

    const webCertManager = lookupService(this, 'web-cert-manager');
    sinon.stub(webCertManager, 'fetchWebCert').resolves({ letsEncrypt: false });
    sinon.stub(webCertManager, 'modifyWebCert').resolves();
    set(webCertManager, '_location', _location);

    const onepanelServer = lookupService(this, 'onepanel-server');
    set(onepanelServer, 'isEmergency', true);

    this.setProperties({
      _location,
      fakeClock: sinon.useFakeTimers({
        now: Date.now(),
        shouldAdvanceTime: true,
      }),
    });
  });

  afterEach(function () {
    this.get('fakeClock').restore();
  });

  [true, false].forEach(isEmergencyGui => {
    [{
      serviceType: 'onezone',
      beforeReloadDomain: 'onezone.org',
      reloadedDomain: 'onezone.org',
    }, {
      serviceType: 'oneprovider',
      beforeReloadDomain: isEmergencyGui ? 'somedomain.onezone.org' : 'onezone.org',
      reloadedDomain: isEmergencyGui ? 'somedomain.onezone.org' : 'onezone.org',
    }].forEach(({ serviceType, beforeReloadDomain, reloadedDomain }) => {
      const emergencyModeDesc = `GUI is ${isEmergencyGui ? '' : 'not '}in emergency mode`;
      it(
        `redirects to ${isEmergencyGui ? serviceType : 'onezone'} domain on next step if LetsEncrypt is enabled and GUI was served via IP address and ${emergencyModeDesc}`,
        async function () {
          set(lookupService(this, 'guiUtils'), 'serviceType', serviceType);
          set(lookupService(this, 'onepanel-server'), 'isEmergency', isEmergencyGui);
          const _location = this.get('_location');
          _location.hostname = '127.0.0.1';
          const nextStep = this.set('nextStep', sinon.spy());
          this.render(hbs `{{new-cluster-web-cert _location=_location nextStep=nextStep}}`);

          await wait();
          await click('.btn-cert-next');
          this.get('fakeClock').tick(reloadDelay);
          await wait();

          if (isEmergencyGui) {
            expect(_location.hostname).to.equal(reloadedDomain);
            expect(_location.reload).to.not.be.called;
          } else {
            // If onezone was served via IP, then we don't care about changing it to its
            // domain. Browsing Onezone via IP is corrupted out-of-the-box. Reload is
            // performed as it is a generic behavior.
            expect(_location.hostname).to.equal('127.0.0.1');
            expect(_location.reload).to.be.calledOnce;
          }
          expect(nextStep).to.be.not.called;
        }
      );

      it(
        `reloads ${serviceType} GUI on next step if LetsEncrypt is enabled and GUI was served via domain and ${emergencyModeDesc}`,
        async function () {
          set(lookupService(this, 'guiUtils'), 'serviceType', serviceType);
          set(lookupService(this, 'onepanel-server'), 'isEmergency', isEmergencyGui);
          const _location = this.get('_location');
          _location.hostname = beforeReloadDomain;
          const nextStep = this.set('nextStep', sinon.spy());
          this.render(hbs `{{new-cluster-web-cert _location=_location nextStep=nextStep}}`);

          await wait();
          await click('.btn-cert-next');
          this.get('fakeClock').tick(reloadDelay);
          await wait();

          expect(_location.hostname).to.equal(reloadedDomain);
          expect(_location.reload).to.be.calledOnce;
          expect(nextStep).to.be.not.called;
        }
      );

      it(`does not reload ${serviceType} GUI on next step if LetsEncrypt is disabled and ${emergencyModeDesc}`,
        async function () {
          set(lookupService(this, 'guiUtils'), 'serviceType', serviceType);
          set(lookupService(this, 'onepanel-server'), 'isEmergency', isEmergencyGui);
          const _location = this.get('_location');
          const oldHostname = _location.hostname;
          const nextStep = this.set('nextStep', sinon.spy());
          this.render(hbs `{{new-cluster-web-cert _location=_location nextStep=nextStep}}`);

          await wait();
          await click('.toggle-field-letsEncrypt');
          await click('.btn-cert-next');
          this.get('fakeClock').tick(reloadDelay);
          await wait();

          expect(_location.hostname).to.equal(oldHostname);
          expect(this.get('_location.reload')).to.be.not.called;
          expect(nextStep, 'nextStep').to.be.called;
        });
    });
  });
});
