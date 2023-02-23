import { expect } from 'chai';
import {
  describe,
  it,
  beforeEach,
} from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import { registerService, lookupService } from '../../helpers/stub-service';
import sinon from 'sinon';
import Service from '@ember/service';
import { resolve } from 'rsvp';
import { set } from '@ember/object';

const onezoneDomain = 'onezone.org';
const oneproviderDomain = `somedomain.${onezoneDomain}`;

const DeploymentManager = Service.extend({
  getClusterConfiguration() {
    return resolve({
      data: {
        onezone: {
          domainName: onezoneDomain,
        },
      },
    });
  },
});

const ProviderManager = Service.extend({
  getProviderDetailsProxy() {
    return promiseObject(resolve({
      domain: oneproviderDomain,
    }));
  },
});

const reloadDelay = 5000;

describe('Integration | Component | new-cluster-web-cert', function () {
  const { afterEach } = setupRenderingTest();

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
      beforeReloadDomain: onezoneDomain,
      reloadedDomain: onezoneDomain,
    }, {
      serviceType: 'oneprovider',
      beforeReloadDomain: isEmergencyGui ? oneproviderDomain : onezoneDomain,
      reloadedDomain: isEmergencyGui ? oneproviderDomain : onezoneDomain,
    }].forEach(({ serviceType, beforeReloadDomain, reloadedDomain }) => {
      const emergencyModeDesc = `GUI is ${isEmergencyGui ? '' : 'not '}in emergency mode`;

      it(
        `${!isEmergencyGui && serviceType === 'oneprovider' ? 'does not ' : ''}redirect to ${isEmergencyGui ? serviceType : 'onezone'} domain on next step if LetsEncrypt is enabled and ${serviceType} GUI was served via IP address and ${emergencyModeDesc}`,
        async function () {
          set(lookupService(this, 'guiUtils'), 'serviceType', serviceType);
          set(lookupService(this, 'onepanel-server'), 'isEmergency', isEmergencyGui);
          const _location = this.get('_location');
          _location.hostname = '127.0.0.1';
          const nextStep = this.set('nextStep', sinon.spy());
          await render(hbs `{{new-cluster-web-cert nextStep=nextStep}}`);

          await click('.btn-cert-next');
          this.get('fakeClock').tick(reloadDelay);
          await settled();

          if (isEmergencyGui || serviceType === 'onezone') {
            expect(_location.hostname).to.equal(reloadedDomain);
            expect(_location.reload).to.not.be.called;
          } else {
            // During the Oneprovider certificate change in hosted GUI we don't change
            // Onezone IP to domain.
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
          await render(hbs `{{new-cluster-web-cert nextStep=nextStep}}`);

          await click('.btn-cert-next');
          this.get('fakeClock').tick(reloadDelay);
          await settled();

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
          await render(hbs `{{new-cluster-web-cert nextStep=nextStep}}`);

          await click('.toggle-field-letsEncrypt');
          await click('.btn-cert-next');
          this.get('fakeClock').tick(reloadDelay);
          await settled();

          expect(_location.hostname).to.equal(oldHostname);
          expect(this.get('_location.reload')).to.be.not.called;
          expect(nextStep, 'nextStep').to.be.called;
        });
    });
  });
});
