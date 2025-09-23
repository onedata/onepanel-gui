/**
 * Common logic used in components that implement configuration of cluster
 * IP adresses. Needs onepanelServer service.
 *
 * @author Jakub Liput
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @copyright (C) 2025 Onedata (onedata.org)
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Mixin from '@ember/object/mixin';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import { scheduleOnce } from '@ember/runloop';
import { Promise, all as allFulfilled } from 'rsvp';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import _ from 'lodash';

export default Mixin.create({
  guiUtils: service(),

  i18nPrefix: 'mixins.components.clusterIpsConfigurator',

  /**
   * @virtual
   * @type {Ember.Service}
   */
  onepanelServer: undefined,

  /**
   * @virtual
   * @type {Ember.Service}
   */
  deploymentManager: undefined,

  /**
   * @virtual
   * @type {PromiseObject<ProviderDetails>}
   */
  providerDetailsProxy: undefined,

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  serviceType: reads('guiUtils.serviceType'),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  subdomainDelegation: reads('providerDetailsProxy.content.subdomainDelegation'),

  /**
   * @type {boolean}
   */
  _hostsIpsFormValid: false,

  /**
   * Stores most recent mapping: hostname -> ip.
   * Initialized right after get cluster IPs resolve.
   * Updated by host form events.
   * @type {Object}
   */
  _formData: undefined,

  /**
   * @type {Promise}
   */
  _ipsSetupPromise: undefined,

  /**
   * Randomly generated ID to trigger computed properties with hosts data to be
   * reloaded.
   * @type {number}
   */
  hostsUpdateId: null,

  /**
   * @type {PromiseObject}
   */
  ipsSetupProxy: computed('_ipsSetupPromise', function ipsSetupProxy() {
    const promise = this._ipsSetupPromise;
    return promise ? promiseObject(promise) : undefined;
  }),

  hostsIpsProxy: computed('hostsUpdateId', function hostsIpsProxy() {
    const promise = (async () => {
      const { hosts } = await this.deploymentManager.getClusterIps();
      return this.prepareHosts(_.cloneDeep(hosts));
    })();
    return promiseObject(promise);
  }),

  /**
   * @type {PromiseObject<Models.ClusterHostInfo>}
   */
  hostsInfoProxy: computed('hostsUpdateId', function hostsInfoProxy() {
    const promise = (async () => {
      const { clusterHostsInfo } = await this.deploymentManager.getClusterHostsInfo();
      return clusterHostsInfo;
    })();
    return promiseObject(promise);
  }),

  /**
   * @type {PromiseObject<Models.ClusterHostInfo>}
   */
  hostsLoadingProxy: computed(
    'hostsIpsProxy',
    'hostsInfoProxy',
    function hostsLoadingProxy() {
      return promiseObject(allFulfilled([
        this.hostsIpsProxy,
        this.hostsInfoProxy,
      ]));
    }
  ),

  init() {
    this.reloadHostData();
    this._super(...arguments);
  },

  _startSetup() {
    return this.get('deploymentManager')
      .modifyClusterIps(this.get('_ipsFormData'))
      .catch(error => {
        this.get('globalNotify').backendError(
          this.get('i18n')
          .t('mixins.components.clusterIpsConfigurator.setupAction'),
          error
        );
        throw error;
      });
  },

  /**
   * @virtual
   * @param {Object} hosts
   * @returns {Object}
   */
  prepareHosts(hosts) {
    return hosts;
  },

  reloadHostData() {
    this.set('hostsUpdateId', Math.random());
    this.hostsIpsProxy.then(hostsIps => {
      safeExec(this, 'set', '_ipsFormData', hostsIps);
    });
  },

  actions: {
    startSetup() {
      const _ipsSetupPromise = this.get('_hostsIpsFormValid') ?
        this._startSetup() : Promise.reject();
      const pro = this.set(
        '_ipsSetupPromise',
        _ipsSetupPromise
      );
      return pro;
    },

    /**
     * @param {boolean} isValid
     */
    hostsIpsFormValidChanged(isValid) {
      scheduleOnce(
        'afterRender',
        this,
        () => safeExec(this, () => {
          if (this.get('_hostsIpsFormValid') !== isValid) {
            this.set('_hostsIpsFormValid', isValid);
          }
        })
      );
    },

    /**
     * Handle update of hostname -> ip mapping event from IPs table
     * @param {string} hostname can contain dots `.`
     * @param {string} ip
     */
    hostsIpsDataChanged(hostname, ip) {
      this.get('_ipsFormData')[hostname] = ip;
    },
  },
});
