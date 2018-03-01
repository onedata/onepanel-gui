import Mixin from '@ember/object/mixin';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import { scheduleOnce } from '@ember/runloop';
import { Promise } from 'rsvp';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { computed } from '@ember/object';

export default Mixin.create({
  i18nPrefix: 'mixins.components.clusterIpsConfigurator',

  /**
   * @virtual
   * @type {Ember.Service}
   */
  clusterManager: undefined,

  /**
   * Initialized on init
   * @type {PromiseObject<Object>}
   */
  hostsIpsProxy: undefined,

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
   * @type {PromiseObject}
   */
  ipsSetupProxy: computed('_ipsSetupPromise', function () {
    const promise = this.get('_ipsSetupPromise');
    return promise ? PromiseObject.create({ promise }) : undefined;
  }),

  _startSetup() {
    return this.get('clusterManager')
      .modifyClusterIps(this.get('_ipsFormData'))
      .catch(error => {
        this.get('globalNotify').backendError(
          this.get('i18n').t('mixins.components.clusterIpsConfigurator.setupAction'),
          error
        );
        throw error;
      });
  },

  /**
   * @virtual optional
   * @type {Function} `(hosts: Object) => any`
   */
  prepareHosts( /* hosts */ ) {},

  init() {
    this._super(...arguments);
    this.set(
      'hostsIpsProxy',
      PromiseObject.create({
        promise: this.get('clusterManager').getClusterIps()
          .then(({ hosts }) => {
            this.prepareHosts(hosts);
            this.set('_ipsFormData', hosts);
            return hosts;
          }),
      }),
    );
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
