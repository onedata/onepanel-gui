import BasicTable from 'onedata-gui-common/components/basic-table';
import { get, set, observer, computed } from '@ember/object';
import { assert } from '@ember/debug';
import { A } from '@ember/array';
import notImplementedWarn from 'onedata-gui-common/utils/not-implemented-warn';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import _ from 'lodash';

export default BasicTable.extend(I18n, {
  tagName: 'table',
  classNames: [
    'cluster-host-table',
    'cluster-host-ip-form',
    'table',
    'table-striped',
    'dropdown-table-rows',
    'table-middle-align',
  ],

  i18nPrefix: 'components.clusterHostIpForm',

  /**
   * @virtual
   * Maps hostname: string => IP address: string
   * @type {Object}
   */
  hosts: Object.freeze({}),

  /**
   * @type {Array<{ip: string, hostname: string}>}
   */
  _hostsData: undefined,

  /**
   * @virtual
   * @type {function}
   */
  allValidChanged: notImplementedWarn,

  /**
   * @virtual
   * @type {function} `(hostsData: EmberArray<{hostname: string, ip: string}>)`
   */
  hostDataChanged: notImplementedWarn,

  init() {
    this._super(...arguments);
    this.set(
      '_hostsData',
      A(
        _.map(
          this.get('hosts'),
          (ip, hostname) => ({ hostname, ip })
        )
      )
    );
    this.observeAllValid();
  },

  allValid: computed('_hostsData.@each.isValid', function getAllValid() {
    return this.get('_hostsData').mapBy('isValid').every(i => i === true);
  }),

  observeAllValid: observer('allValid', function notifyAllValid() {
    this.get('allValidChanged')(this.get('allValid'));
  }),

  actions: {
    valueChanged(hostname, ip) {
      const hostsDataArray = this.get('_hostsData').toArray();
      const host = _.find(hostsDataArray, h => get(h, 'hostname') === hostname);
      assert(host, 'tried to change IP data on non-existent host entry');
      set(host, 'ip', ip);
      this.get('hostDataChanged')(hostname, ip);
    },

    /**
     * @param {string} hostname 
     * @param {EmberObject} validation 
     * @param {boolean} validation.isValid
     * @param {Array<string>} validation.messages
     * @param {Array<string>} validation.errors
     */
    validationChanged(hostname, validation) {
      const hostsDataArray = this.get('_hostsData').toArray();
      const host = _.find(hostsDataArray, h => get(h, 'hostname') === hostname);
      assert(host, 'tried to change validation data on non-existent host entry');
      set(host, 'isValid', get(validation, 'isValid'));
    },
  },
});
