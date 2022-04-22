import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { click } from 'ember-native-dom-helpers';
import sinon from 'sinon';
import $ from 'jquery';
import { get, set } from '@ember/object';
import { resolve, Promise } from 'rsvp';
import wait from 'ember-test-helpers/wait';
import Service from '@ember/service';
import { registerService, lookupService } from '../../helpers/stub-service';

describe('Integration | Component | new cluster ceph', function () {
  setupRenderingTest();

  beforeEach(function () {
    registerService(this, 'onepanel-server', OnepanelServerStub);
    const onepanelServer = lookupService(this, 'onepanel-server');
    sinon.stub(onepanelServer, 'request')
      .withArgs('CephApi', 'getBlockDevices', 'example.com')
      .resolves({
        data: {
          blockDevices: [{
            path: 'a',
            size: 100,
          }, {
            path: 'b',
            size: 200,
          }],
        },
      });

    this.set('stepData', {
      clusterDeployProcess: {
        cephNodes: ['example.com'],
        configuration: {
          ceph: {
            name: 'ceph',
            managers: [{
              host: 'example.com',
            }],
            monitors: [{
              host: 'example.com',
            }],
            osds: [{
              uuid: 'cbe252dd-5e8e-405b-a356-899e70a1e415',
              host: 'example.com',
              type: 'blockdevice',
              device: 'a',
            }, {
              uuid: 'cbe252dd-5e8e-405b-a356-899e70a1e415',
              host: 'example.com',
              type: 'blockdevice',
              device: 'b',
            }, {
              uuid: 'cbe252dd-5e8e-405b-a356-899e70a1e416',
              host: 'example.com',
              type: 'loopdevice',
              path: '/some/path',
              size: 1000000,
            }],
          },
        },
        startDeploy: () => resolve(),
      },
    });
  });

  it(
    'shows "block device warning" modal before deploy, when there are osds with block device',
    async function () {
      const startDeploySpy = sinon.spy(
        this.get('stepData.clusterDeployProcess'),
        'startDeploy'
      );

      await render(hbs `{{new-cluster-ceph stepData=stepData}}`);

      return click('.btn-deploy-cluster')
        .then(() => {
          const $modal = $('.block-device-format-warning-modal.in');
          const $proceedBtn = $modal.find('.proceed');
          expect($modal).to.exist;
          expect($modal.find('.modal-header').text()).to.contain('Warning');
          expect($modal.find('.modal-header .one-icon'))
            .to.have.class('oneicon-sign-warning-rounded');
          expect($modal.find('.message').text().trim()).to.equal(
            'Creating Object Storage Deamons will erase all data on the following block devices:'
          );
          expect($modal.find('.node')).to.have.length(1);
          expect($modal.find('.node').eq(0).text())
            .to.match(/^[\s]*example.com:[\s]*a,[\s]*b[\s]*$/);
          expect($proceedBtn.text().trim()).to.equal('Deploy');
          expect($proceedBtn).to.have.class('btn-warning');
          expect(startDeploySpy).to.not.be.called;
        });
    }
  );

  it('allows to start deploy in "block device warning" modal', async function () {
    let resolveDeployCallback;
    const startDeploySpy = sinon.stub(
      this.get('stepData.clusterDeployProcess'),
      'startDeploy'
    ).returns(new Promise(resolve => {
      resolveDeployCallback = resolve;
    }));

    await render(hbs `{{new-cluster-ceph stepData=stepData}}`);

    return click('.btn-deploy-cluster')
      .then(() => click($('.block-device-format-warning-modal.in .proceed')[0]))
      .then(() => {
        expect(startDeploySpy).to.be.called;
        expect($('.block-device-format-warning-modal.in .proceed'))
          .to.have.class('pending');
        resolveDeployCallback();
        return wait();
      })
      .then(() =>
        expect($('.block-device-format-warning-modal.in')).to.not.exist
      );
  });

  it(
    'allows to cancel deployment start in block device warning modal',
    async function () {
      const startDeploySpy = sinon.spy(
        this.get('stepData.clusterDeployProcess'),
        'startDeploy'
      );

      await render(hbs `{{new-cluster-ceph stepData=stepData}}`);

      return click('.btn-deploy-cluster')
        .then(() => click($('.block-device-format-warning-modal.in .cancel')[0]))
        .then(() => {
          expect(startDeploySpy).to.not.be.called;
          expect($('.block-device-format-warning-modal.in')).to.not.exist;
        });
    }
  );

  it(
    'does not show "block device warning" modal before deploy when there are no osds with block device',
    async function () {
      const deployData = this.get('stepData.clusterDeployProcess');
      const osds = get(deployData, 'configuration.ceph.osds');
      set(
        deployData,
        'configuration.ceph.osds',
        osds.rejectBy('type', 'blockdevice')
      );
      const startDeploySpy = sinon.spy(deployData, 'startDeploy');

      await render(hbs `{{new-cluster-ceph stepData=stepData}}`);

      return click('.btn-deploy-cluster')
        .then(() => {
          expect($('.block-device-format-warning-modal.in')).to.not.exist;
          expect(startDeploySpy).to.be.called;
        });
    }
  );
});

const OnepanelServerStub = Service.extend({
  request() {},
});
