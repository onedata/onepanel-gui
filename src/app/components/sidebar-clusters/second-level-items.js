/**
 * Second level sidebar items component. Extends basic implementation from
 * onedata-gui-common with extra data available for Onepanel gui.
 *
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import SecondLevelItems from 'onedata-gui-common/components/sidebar-clusters/second-level-items';
import { inject as service } from '@ember/service';
import { computed, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default SecondLevelItems.extend(I18n, {
  dnsManager: service(),
  webCertManager: service(),
  cephManager: service(),
  memberManager: service(),
  guiSettingsManager: service(),
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
   * @type {Ember.ComputedProperty<boolean>}
   */
  hasNoConnectedUser: reads('memberManager.hasNoConnectedUser'),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  guiSettingsValid: reads('guiSettingsManager.guiSettingsValid'),

  /**
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

  /**
   * @type {Ember.ComputedProperty<Object>}
   */
  cephItem: computed('cephManager.lastStatus.level', function cephItem() {
    const cephStatusLevel = this.get('cephManager.lastStatus.level');
    return {
      id: 'ceph',
      label: this.t('ceph'),
      icon: 'ceph',
      warningMessage: (cephStatusLevel && cephStatusLevel !== 'ok') ?
        this.t('cephWarning') : undefined,
    };
  }),

  membersItem: computed('hasNoConnectedUser', function membersItem() {
    return {
      id: 'members',
      label: this.t('members'),
      icon: 'group',
      warningMessage: this.get('hasNoConnectedUser') ?
        this.t('noConnectedUserWarning') : undefined,
    };
  }),

  emergencyPassphraseItem: computed(function emergencyPassphraseItem() {
    return {
      id: 'emergency-passphrase',
      label: this.t('emergencyPassphrase'),
      icon: 'key',
    };
  }),

  guiSettingsItem: computed('guiSettingsValid', function guiSettingsItem() {
    return {
      id: 'gui-settings',
      label: this.t('guiSettings'),
      icon: 'view-grid',
      warningMessage: !this.get('guiSettingsValid') ?
        this.t('guiSettingsWarning') : undefined,
    };
  }),

  /**
   * @override
   */
  clusterSecondLevelItems: computed(
    'isNotDeployedCluster',
    'isLocalCluster',
    'cluster.installationDetails.hasCephDeployed',
    'isEmergencyOnepanel',
    'clusterType',
    'dnsItem',
    'certificateItem',
    'emergencyPassphraseItem',
    'nodesItem',
    'overviewItem',
    'providerItem',
    'cephItem',
    'storagesItem',
    'spacesItem',
    'guiSettingsItem',
    'membersItem',
    function clusterSecondLevelItems() {
      const {
        isNotDeployedCluster,
        isLocalCluster,
        isEmergencyOnepanel,
        emergencyPassphraseItem,
        cephItem,
        clusterType,
        cluster,
      } = this.getProperties(
        'isNotDeployedCluster',
        'isLocalCluster',
        'isEmergencyOnepanel',
        'emergencyPassphraseItem',
        'cephItem',
        'clusterType',
        'cluster'
      );
      if (isNotDeployedCluster || !isLocalCluster || !clusterType) {
        return [];
      } else {
        let items = this._super(...arguments);

        const hasCephDeployed = get(cluster, 'installationDetails.hasCephDeployed');
        if (!hasCephDeployed) {
          items = items.without(cephItem);
        }
        if (isEmergencyOnepanel) {
          items.push(emergencyPassphraseItem);
        }
        return items;
      }
    }
  ),

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
