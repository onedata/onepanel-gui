/**
 * Cluster init step: installation a.k.a. deployment
 *
 * Invokes passed actions:
 * - nextStep() - a next step of cluster init should be presented
 *
 * @module components/new-cluster-installation
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

import { A } from '@ember/array';
import { assert } from '@ember/debug';
import { inject as service } from '@ember/service';
import { Promise } from 'rsvp';
import { readOnly, sort } from '@ember/object/computed';
import { scheduleOnce, later } from '@ember/runloop';
import { observer, computed, get, set } from '@ember/object';
import ClusterHostInfo from 'onepanel-gui/models/cluster-host-info';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import _ from 'lodash';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import NewClusterDeployProcess from 'onepanel-gui/utils/new-cluster-deploy-process';
import { getOwner } from '@ember/application';

function getHostnamesOfType(hosts, type) {
  return hosts.filter(h => h[type]).map(h => h.hostname);
}

export default Component.extend(I18n, {
  classNames: ['new-cluster-installation', 'container-fluid'],

  onepanelServer: service(),
  clusterManager: service(),
  globalNotify: service(),
  i18n: service(),

  i18nPrefix: 'components.newClusterInstallation',

  /**
   * Notifies about ceph selection change
   * @type {function}
   * @param {boolean} cephEnabled
   * @returns {undefined}
   */
  cephChanged: notImplementedIgnore,

  onepanelServiceType: readOnly('onepanelServer.serviceType'),

  /**
   * @virtual optional
   * @type {string}
   * If the cluster deployment is in progress on initializing this component,
   * this property should contain ID of server deployment task.
   */
  deploymentTaskId: undefined,

  primaryClusterManager: null,

  /**
   * Resolves with EmberArray of HostInfo.
   * @type {PromiseObject.EmberArray.HostInfo}
   */
  hostsProxy: null,

  /**
   * @type {Utils/NewClusterDeployProcess}
   */
  clusterDeployProcess: computed(function clusterDeployProcess() {
    return NewClusterDeployProcess.create(getOwner(this).ownerInjection(), {
      onFinish: () => this.configureFinished(),
    });
  }),

  hosts: readOnly('hostsProxy.content'),

  /**
   * @type {Array<string>}
   */
  hostsSorting: Object.freeze(['hostname']),

  /**
   * @type {Ember.ComputedProperty<Ember.Array<HostInfo>>}
   */
  hostsSorted: sort('hosts', 'hostsSorting'),

  /**
   * If true, the deploy action can be invoked
   * @type {boolean}
   */
  canDeploy: false,

  hostsUsed: computed('hosts.@each.isUsed', function () {
    let hosts = this.get('hosts');
    return hosts.filter(h => h.get('isUsed'));
  }).readOnly(),

  _zoneName: '',
  _zoneDomainName: '',

  /**
   * @type {boolean}
   */
  _zoneOptionsValid: false,

  /**
   * @type {boolean}
   */
  _hostTableValid: false,

  /**
   * @type {string}
   */
  _newHostname: '',

  /**
   * @type {boolean}
   */
  _isSubmittingAddress: false,

  /**
   * @type {function}
   */
  changeClusterName: undefined,

  /**
   * @type {function}
   */
  nextStep: undefined,

  /**
   * Changed on add new host button click
   * @type {boolean}
   */
  addingNewHost: false,

  /**
   * @type {number}
   */
  newHostExpirationTimeout: 2000,

  /**
   * @type {Ember.A}
   */
  newHosts: undefined,

  /**
   * @type {boolean}
   */
  addMoreInfoVisible: false,

  /**
   * @type {string}
   */
  couchbasePorts: '4369, 8091, 8092, 11207, 11209, 11210, 11211, 18091, 18092, ' +
    '21100 - 21299',

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  clusterPorts: computed('onepanelServiceType', function () {
    const onepanelServiceType = this.get('onepanelServiceType');
    return (onepanelServiceType === 'zone' ? '52, ' : '') +
      '80, 443, 4369, 9100 - 9139';
  }),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  panelType: computed('onepanelServiceType', function () {
    const {
      i18n,
      onepanelServiceType,
    } = this.getProperties('i18n', 'onepanelServiceType');
    return onepanelServiceType ?
      'One' + _.lowerCase(i18n.t(
        `services.guiUtils.serviceType.${onepanelServiceType}`
      )) : null;
  }),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  cephEnabled: computed('hosts.@each.ceph', function cephEnabled() {
    const hosts = this.get('hosts');
    return hosts ? hosts.isAny('ceph') : false;
  }),

  addingNewHostChanged: observer('addingNewHost', function () {
    if (!this.get('addingNewHost')) {
      this.set('_newHostname', '');
    }
  }),

  cephEnabledObserver: observer('cephEnabled', function cephEnabledObserver() {
    this.get('cephChanged')(this.get('cephEnabled'));
  }),

  init() {
    this._super(...arguments);
    this.observeResetNewHostname();
    this.changeCanDeploy();

    const {
      deploymentTaskId,
      onepanelServiceType,
      clusterManager,
    } = this.getProperties(
      'cephEnabled',
      'deploymentTaskId',
      'onepanelServiceType',
      'clusterManager',
    );

    this.setProperties({
      hostsProxy: PromiseObject.create({
        promise: clusterManager.getHosts()
          .then(hosts => A(hosts.map(h => ClusterHostInfo.create(h)))),
      }),
      newHosts: A(),
    });

    if (onepanelServiceType === 'provider') {
      this.set('_zoneOptionsValid', true);
    }

    if (deploymentTaskId) {
      this.get('clusterDeployProcess').watchExistingDeploy(deploymentTaskId);
    }
  },

  willDestroyElement() {
    try {
      this.set('clusterDeployProcess.onFinish', notImplementedIgnore);
    } finally {
      this._super(...arguments);
    }
  },

  configureFinished() {
    const {
      onepanelServiceType,
      _zoneName,
      changeClusterName,
      nextStep,
    } = this.getProperties(
      'onepanelServiceType',
      '_zoneName',
      'changeClusterName',
      'nextStep'
    );
    if (onepanelServiceType === 'zone') {
      changeClusterName(_zoneName);
    }
    nextStep();
  },

  getNodes() {
    let hosts = this.get('hosts');
    let hostnames = hosts.map(h => get(h, 'hostname'));
    let nodes = {};
    hostnames.forEach(hostname => {
      nodes[hostname] = { hostname };
    });
    return nodes;
  },

  /**
   * Create an object of cluster deployment configuration using onepanel lib
   * @param {string} serviceType one of: provider, zone
   * @return {Onepanel.ProviderConfiguration|Onepanel.ZoneConfiguration}
   */
  createConfiguration() {
    let {
      hostsUsed,
      primaryClusterManager,
      _zoneName,
      _zoneDomainName,
      onepanelServiceType,
    } = this.getProperties(
      'hostsUsed',
      'primaryClusterManager',
      '_zoneName',
      '_zoneDomainName',
      'onepanelServiceType'
    );

    let nodes = this.getNodes();
    let hostnames = hostsUsed.map(h => h.hostname);
    if (!hostnames || hostnames.length === 0) {
      throw new Error(
        'Cannot create cluster configuration if no hosts are selected');
    }

    let configProto = {
      cluster: {
        autoDeploy: true,
        domainName: '',
        nodes,
        managers: {
          mainNode: primaryClusterManager,
          nodes: getHostnamesOfType(hostsUsed, 'clusterManager'),
        },
        workers: {
          nodes: getHostnamesOfType(hostsUsed, 'clusterWorker'),
        },
        databases: {
          nodes: getHostnamesOfType(hostsUsed, 'database'),
        },
      },
      onepanel: {
        interactiveDeployment: true,
        users: [],
      },
    };

    // in zone mode, add zone name    
    if (onepanelServiceType === 'zone') {
      configProto.onezone = {
        name: _zoneName,
        domainName: _zoneDomainName,
      };
    }

    return configProto;
  },

  changeCanDeploy: observer('_hostTableValid', '_zoneOptionsValid',
    function () {
      let canDeploy = this.get('_hostTableValid') && this.get('_zoneOptionsValid');
      scheduleOnce('afterRender', this, () => this.set('canDeploy', canDeploy));
    }),

  observeResetNewHostname: observer('addingNewHost', function () {
    if (this.get('addingNewHost')) {
      scheduleOnce('afterRender', () => this.$('.input-add-host')[0].focus());
    } else {
      this.set('_newHostname', '');
    }
  }),

  /**
   * Temporary adds host to newHosts array
   * @param {ClusterHostInfo} host 
   */
  markHostAsNew(host) {
    const {
      newHosts,
      newHostExpirationTimeout,
    } = this.getProperties('newHosts', 'newHostExpirationTimeout');
    newHosts.pushObject(host);
    later(
      this,
      () => safeExec(newHosts, 'removeObject', host),
      newHostExpirationTimeout
    );
  },

  actions: {
    zoneFormChanged(fieldName, value) {
      switch (fieldName) {
        case 'main.name':
          this.set('_zoneName', value);
          break;
        case 'main.domainName':
          this.set('_zoneDomainName', value);
          break;
        default:
          throw 'Unexpected field changed in zone installation form: ' + fieldName;
      }
    },

    hostOptionChanged(hostname, option, value) {
      let hosts = this.get('hosts');
      let host = hosts.find(h => get(h, 'hostname') === hostname);
      assert(
        host,
        'host for which option was changed, must be present in collection'
      );
      set(host, option, value);
    },

    primaryClusterManagerChanged(hostname) {
      this.set('primaryClusterManager', hostname);
    },

    /**
     * Handle new validation state of user options in hosts table. 
     *
     * @param {boolean} isValid
     * @returns {undefined}
     */
    hostTableValidChanged(isValid) {
      this.set('_hostTableValid', isValid);
    },

    zoneOptionsValidChanged(isValid) {
      this.set('_zoneOptionsValid', isValid);
    },

    startDeploy() {
      const {
        canDeploy,
        clusterDeployProcess,
      } = this.getProperties('canDeploy', 'clusterDeployProcess');
      if (canDeploy !== true) {
        return new Promise((_, reject) => reject());
      }
      clusterDeployProcess.set('configuration', this.createConfiguration());
      return clusterDeployProcess.startDeploy();
    },

    submitNewHost() {
      if (!this.get('_newHostname')) {
        return Promise.reject();
      } else {
        const _newHostname = this.get('_newHostname');
        this.set('_isSubmittingNewHost', true);
        return this.get('clusterManager').addKnownHost(_newHostname)
          .then(knownHost => {
            const newHost = ClusterHostInfo.create(knownHost);
            this.get('hosts').pushObject(newHost);
            this.markHostAsNew(newHost);
          })
          .then(() => safeExec(this, 'setProperties', {
            addingNewHost: false,
            addMoreInfoVisible: false,
          }))
          .catch(error =>
            this.get('globalNotify').backendError(this.tt('addingNewHost'), error)
          )
          .finally(() => safeExec(this, 'set', '_isSubmittingNewHost', false));
      }
    },

    removeHost(hostname) {
      const {
        onepanelServer,
        globalNotify,
        hosts,
      } = this.getProperties('onepanelServer', 'globalNotify', 'hosts');

      return onepanelServer
        .request('onepanel', 'removeClusterHost', hostname)
        .then(() => {
          hosts.removeObject(hosts.find(h => get(h, 'hostname') === hostname));
          if (this.get('primaryClusterManager') === hostname) {
            safeExec(this, 'set', 'primaryClusterManager', undefined);
          }
        })
        .catch(error => {
          globalNotify.backendError(this.t('removingHost'), error);
          throw error;
        });
    },
  },
});
