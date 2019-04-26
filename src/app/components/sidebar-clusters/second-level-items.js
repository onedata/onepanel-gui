/**
 * Second level sidebar items component. Extends basic implementation from
 * onedata-gui-common with extra data available for Onepanel gui.
 *
 * @module component/sidebar-cluster/second-level-items
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import SecondLevelItems from 'onedata-gui-common/components/sidebar-clusters/second-level-items';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default SecondLevelItems.extend(I18n, {
  dnsManager: service(),
  webCertManager: service(),
  onepanelServer: service(),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isNotDeployedCluster: reads('item.isNotDeployed'),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isLocalCluster: reads('item.isLocal'),

  /**
   * @type {Ember.ComputerProperty<boolean>}
   */
  webCertValid: reads('webCertManager.webCertValid'),

  /**
   * @override
   * @type {ComputedProperty<boolean>}
   */
  isEmergencyOnepanel: reads('onepanelServer.isEmergency'),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  dnsValid: computed(
    'dnsManager.{dnsValid,dnsCheckProxy.isRejected}',
    function dnsValid() {
      return this.get('dnsManager.dnsValid') !== false &&
        !this.get('dnsManager.dnsCheckProxy.isRejected');
    }
  ),

  dnsItem: computed('dnsValid', function dnsItem() {
    return {
      id: 'dns',
      label: this.t('dns'),
      icon: 'globe-cursor',
      warningMessage: this.get('dnsValid') === false ?
        this.t('dnsWarning') : undefined,
    };
  }),

  certificateItem: computed('webCertValid', function certificateItem() {
    return {
      id: 'certificate',
      label: this.t('certificate'),
      icon: 'certificate',
      warningMessage: this.get('webCertValid') === false ?
        this.t('webCertWarning') : undefined,
    };
  }),

  init() {
    this._super(...arguments);
    this.get('dnsManager').getDnsCheckProxy({
      fetchArgs: [{ forceCheck: false }],
    });
    // because of bug in ember observers/computed in service
    this.get('dnsManager.dnsValid');
    this.get('dnsManager.dnsCheckProxy.isRejected');

    this.get('webCertManager').getWebCertProxy();
  },
});
