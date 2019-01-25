/**
 * Second level sidebar items component. Extends basic implementation from
 * onedata-gui-common with extra data available for Onepanel gui.
 *
 * @module component/sidebar-cluster/second-level-items
 * @author Michal Borzecki, Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import SecondLevelItems from 'onedata-gui-common/components/two-level-sidebar/second-level-items';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default SecondLevelItems.extend(I18n, {
  dnsManager: service(),
  webCertManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.sidebarClusters.secondLevelItems',

  isNotDeployedCluster: reads('item.isNotDeployed'),

  clusterType: reads('item.type'),

  /**
   * @type {Ember.ComputerProperty<boolean>}
   */
  webCertValid: reads('webCertManager.webCertValid'),

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

  overviewItem: computed(function overviewItem() {
    return {
      id: 'overview',
      label: this.t('overview'),
      icon: 'overview',
    };
  }),

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

  credentialsItem: computed(function credentialsItem() {
    return {
      id: 'credentials',
      label: this.t('credentials'),
      icon: 'user',
    };
  }),

  nodesItem: computed(function nodesItem() {
    return {
      id: 'nodes',
      label: this.t('nodes'),
      icon: 'node',
    };
  }),

  providerItem: computed(function providerItem() {
    return {
      id: 'provider',
      label: this.t('provider'),
      icon: 'provider',
    };
  }),

  storagesItem: computed(function storagesItem() {
    return {
      id: 'storages',
      label: this.t('storages'),
      icon: 'support',
    };
  }),

  spacesItem: computed(function spacesItem() {
    return {
      id: 'spaces',
      label: this.t('spaces'),
      icon: 'space',
    };
  }),

  clusterSecondLevelItems: computed(
    'isNotDeployedCluster',
    'clusterType',
    'dnsItem',
    'certificateItem',
    'credentialsItem',
    'nodesItem',
    'overviewItem',
    'providerItem',
    'storagesItem',
    'spacesItem',
    function () {
      if (this.get('isNotDeployedCluster')) {
        return [];
      } else {
        const {
          clusterType,
          dnsItem,
          certificateItem,
          credentialsItem,
          nodesItem,
          overviewItem,
          providerItem,
          storagesItem,
          spacesItem,
        } = this.getProperties(
          'clusterType',
          'cluster',
          'dnsItem',
          'certificateItem',
          'credentialsItem',
          'nodesItem',
          'overviewItem',
          'providerItem',
          'storagesItem',
          'spacesItem',
        );
        const commonItems = [
          overviewItem,
          nodesItem,
          dnsItem,
          certificateItem,
          credentialsItem,
        ];
        return clusterType === 'onezone' ? commonItems : [
          ...commonItems,
          providerItem,
          storagesItem,
          spacesItem,
        ];
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

    // overwrite injected property
    this.set('internalSecondLevelItems', reads('clusterSecondLevelItems'));
  },
});
