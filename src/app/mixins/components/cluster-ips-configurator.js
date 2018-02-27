import Mixin from '@ember/object/mixin';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import { scheduleOnce } from '@ember/runloop';
import { Promise } from 'rsvp';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

export default Mixin.create(I18n, {
  // FIXME: change to use mixin translations
  i18nPrefix: 'components.newClusterIps',

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

  _startSetup() {
    return this.get('clusterManager').modifyClusterIps(this.get('_ipsFormData'))
      .catch(error => {
        // FIXME: translations for mixin
        this.get('globalNotify').backendError(this.t('dnsSetup'), error);
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
      if (this.get('_hostsIpsFormValid') === true) {
        return this._startSetup();
      } else {
        return Promise.reject();
      }
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
