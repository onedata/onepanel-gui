/**
 * Cluster init step: DNS setup for Zone cluster
 *
 * @module components/new-cluster-ips
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { scheduleOnce } from '@ember/runloop';
import { Promise } from 'rsvp';
import { reads } from '@ember/object/computed';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  classNames: ['new-cluster-dns', 'container-fluid'],

  onepanelServer: service(),
  clusterManager: service(),
  globalNotify: service(),
  cookies: service(),

  i18nPrefix: 'components.newClusterIps',

  onepanelServiceType: reads('onepanelServer.serviceType'),

  /**
   * Initialized on init
   * @type {PromiseObject<Object>}
   */
  hostsProxy: undefined,

  hosts: reads('hostsProxy.content'),

  /**
   * If true, the deploy action can be invoked
   * @type {boolean}
   */
  canDeploy: false,

  /**
   * The promise resolves when we know if we have unfinished deployment.
   * Initiliazed in `init`.
   * @type {PromiseObject}
   */
  deploymentStatusProxy: undefined,

  deploymentStatusLoading: reads('deploymentStatusProxy.isPending'),

  /**
   * @type {boolean}
   */
  _hostFormValid: false,

  /**
   * Stores most recent mapping: hostname -> ip.
   * Initialized right after get cluster IPs resolve.
   * Updated by host form events.
   * @type {Object}
   */
  _formData: undefined,

  /**
   * @type {function}
   */
  nextStep: undefined,

  _willSubmit: false,

  init() {
    this._super(...arguments);

    this.set(
      'hostsProxy',
      PromiseObject.create({
        promise: this.get('clusterManager').getClusterIps()
          .then(({ hosts }) => {
            this.set('_formData', hosts);
            return hosts;
          }),
      }),
    );

  },

  _startSetup() {
    return this.get('clusterManager').modifyClusterIps(this.get('_formData'))
      .catch(error => {
        this.get('globalNotify').backendError(this.t('dnsSetup'), error);
        throw error;
      })
      .then(() => this.get('nextStep')());
  },

  actions: {
    startSetup() {
      if (this.get('_hostFormValid') === true) {
        return this._startSetup();
      } else {
        return Promise.reject();
      }
    },

    /**
     * @param {boolean} isValid 
     */
    hostFormValidChanged(isValid) {
      scheduleOnce(
        'afterRender',
        this,
        () => safeExec(this, () => {
          if (this.get('_hostFormValid') !== isValid) {
            this.set('_hostFormValid', isValid);
          }
        })
      );
    },

    /**
     * Handle update of hostname -> ip mapping event from IPs table
     * @param {string} hostname can contain dots `.`
     * @param {string} ip 
     */
    hostDataChanged(hostname, ip) {
      this.get('_formData')[hostname] = ip;
    },
  },
});
