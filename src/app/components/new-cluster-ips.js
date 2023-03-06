/**
 * Cluster init step: DNS setup for Onezone cluster
 *
 * @author Jakub Liput
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import clusterIpsConfigurator from 'onepanel-gui/mixins/components/cluster-ips-configurator';

export default Component.extend(I18n, clusterIpsConfigurator, {
  classNames: ['new-cluster-ips', 'container-fluid'],

  onepanelServer: service(),
  deploymentManager: service(),
  globalNotify: service(),

  i18nPrefix: 'components.newClusterIps',

  /**
   * @virtual
   * @type {Function} `() => any`
   */
  nextStep: undefined,

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
    return hosts;
  },

  _startSetup() {
    return this._super(...arguments).then(() => this.get('nextStep')());
  },
});
