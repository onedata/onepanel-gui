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
import { reads } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import clusterIpsConfigurator from 'onepanel-gui/mixins/components/cluster-ips-configurator';

export default Component.extend(I18n, clusterIpsConfigurator, {
  classNames: ['new-cluster-dns', 'container-fluid'],

  onepanelServer: service(),
  clusterManager: service(),
  globalNotify: service(),
  cookies: service(),

  i18nPrefix: 'components.newClusterIps',

  /**
   * @virtual
   * @type {Function} `() => any`
   */
  nextStep: undefined,

  onepanelServiceType: reads('onepanelServer.serviceType'),

  /**
   * @override 
   * @param {Object} hosts 
   */
  prepareHosts(hosts) {
    for (const hostname in hosts) {
      if (hosts[hostname] === '127.0.0.1') {
        hosts[hostname] = '';
      }
    }
  },

  _startSetup() {
    return this._super(...arguments).then(() => this.get('nextStep')());
  },
});