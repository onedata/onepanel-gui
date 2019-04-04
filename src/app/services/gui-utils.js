/**
 * Provides data and implementation of utils specific for onepanel gui.
 *
 * @module services/gui-utils
 * @author Michal Borzecki
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import GuiUtils from 'onedata-gui-common/services/gui-utils';
import { get, computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import { resolve } from 'rsvp';

export default GuiUtils.extend(
  createDataProxyMixin('guiName'), {
    onepanelServer: service(),
    onepanelConfiguration: service(),
    onezoneGui: service(),
    providerManager: service(),
    clusterModelManager: service(),
    session: service(),

    /**
     * @override
     */
    guiIcon: 'assets/images/onepanel-logo.svg',

    /**
     * Just an alias - this name was used in the past
     * @type {Ember.ComputedProperty<string>}
     */
    onepanelServiceType: reads('serviceType'),

    guiVersion: reads('onepanelConfiguration.version'),

    /**
     * Panel type: oneprovider or onezone.
     * @type {Ember.ComputedProperty<string>}
     */
    serviceType: computed('onepanelConfiguration.serviceType', function serviceType() {
      return this.get('onepanelServer').getClusterTypeFromUrl() ||
        this.get('onepanelConfiguration.serviceType');
    }),

    /**
     * Full panel type name: Oneprovider or Onezone.
     * @type {Ember.ComputedProperty<string>}
     */
    fullServiceName: computed('serviceType', function () {
      const serviceType = this.get('serviceType');
      return serviceType ?
        this.t(`serviceType.${serviceType}`) : null;
    }),

    /**
     * @override
     * One of: Oneprovider Panel, Onezone Panel
     */
    guiType: computed('serviceType', function () {
      const serviceType = this.get('serviceType');
      return this.t(`serviceType.${serviceType}`) + ' ' + this.t('panel');
    }),

    /**
     * @override
     */
    manageAccountExternalLink: computed(
      'onezoneGui.onezoneGuiUrl',
      function manageAccountExternalLink() {
        const onezoneGuiUrl = this.get('onezoneGui.onezoneGuiUrl');
        return `${onezoneGuiUrl}/onedata/users`;
      }
    ),

    /**
     * @override
     */
    manageAccountText: computed(
      'onezoneGui.zoneDomain',
      'serviceType',
      'clusterModelManager.currentCluster.isNotDeployed',
      function manageAccountText() {
        const {
          onepanelServer,
          serviceType,
          i18n,
          onezoneGui,
          clusterModelManager,
        } = this.getProperties(
          'onepanelServer',
          'i18n',
          'onezoneGui',
          'clusterModelManager',
          'serviceType'
        );
        if (get(onepanelServer, 'isEmergency')) {
          const isDeployed =
            get(clusterModelManager, 'currentCluster.isNotDeployed') === false;
          if ((serviceType === 'oneprovider' && get(onezoneGui, 'zoneDomain')) ||
            (serviceType === 'onezone' && isDeployed)) {
            return i18n.t('components.userAccountButton.visitViaOnezone');
          } else {
            return null;
          }
        } else {
          return i18n.t('components.userAccountButton.manageAccount');
        }
      }
    ),

    init() {
      this._super(...arguments);
      this.updateGuiNameProxy();
    },

    fetchGuiName() {
      if (this.get('serviceType') === 'onezone') {
        return this.get('onepanelConfiguration').getConfigurationProxy()
          .then(config => get(config, 'zoneName'));
      } else {
        if (this.get('onepanelServer.isInitialized')) {
          return this.get('providerManager').getProviderDetailsProxy({ reload: true })
            .then(provider => provider && get(provider, 'name'));
        } else {
          return resolve(null);
        }
      }
    },
  });
