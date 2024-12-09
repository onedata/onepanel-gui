/**
 * A responsive table with hostname -> IP address to set
 *
 * @author Jakub Liput
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import BasicTable from 'onedata-gui-common/components/basic-table';
import { get, set, observer, computed } from '@ember/object';
import { assert } from '@ember/debug';
import { A } from '@ember/array';
import { next } from '@ember/runloop';
import notImplementedWarn from 'onedata-gui-common/utils/not-implemented-warn';
import I18n from 'onedata-gui-common/mixins/i18n';
import _ from 'lodash';
import $ from 'jquery';

export default BasicTable.extend(I18n, {
  tagName: 'table',
  classNames: [
    'cluster-host-table',
    'with-form',
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
  hostsIps: Object.freeze({}),

  /**
   * @virtual
   * @type {Array<Models.ClusterHostInfo>}
   */
  hostsInfo: undefined,

  /**
   * @virtual optional
   * @type {boolean}
   */
  isReadOnly: false,

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

  /**
   * @type {EmberArray<{ip: string, hostname: string, tags: Array<SafeString>}>}
   */
  _hostsData: undefined,

  allValid: computed('_hostsData.@each.isValid', function getAllValid() {
    return this.get('_hostsData').mapBy('isValid').every(i => i === true);
  }),

  observeAllValid: observer('allValid', function notifyAllValid() {
    this.get('allValidChanged')(this.get('allValid'));
  }),

  observeHosts: observer('hostsIps', 'hostsInfo', function observeHosts() {
    this.set('_hostsData', A(_.sortBy(
      this.hostsInfo
      .filter(({ clusterWorker, oneS3 }) => clusterWorker || oneS3)
      .map(({ hostname, clusterWorker, oneS3 }) => ({
        hostname: hostname,
        ip: this.hostsIps[hostname] ?? '',
        tags: [
          (clusterWorker && this.t('tags.clusterWorker')),
          (oneS3 && this.t('tags.oneS3')),
        ].filter(Boolean),
      })),
      ['hostname']
    )));
  }),

  init() {
    this._super(...arguments);

    this.observeHosts();
    this.observeAllValid();
  },

  didInsertElement() {
    this._super(...arguments);
    next(() => {
      $(this.get('element')).find('tbody .row-header').click();
    });

  },

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
