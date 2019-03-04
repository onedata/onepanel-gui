/**
 * Provides data and implementation of utils specific for onepanel gui.
 *
 * @module services/gui-utils
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import GuiUtils from 'onedata-gui-common/services/gui-utils';
import { get, computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import { resolve } from 'rsvp';

export default GuiUtils.extend(
  createDataProxyMixin('guiVersion'),
  createDataProxyMixin('guiName'), {
    onepanelServer: service(),
    onepanelConfiguration: service(),
    onezoneGui: service(),
    providerManager: service(),
    clusterModelManager: service(),
    session: service(),

    /**
     * Panel type: provider or zone.
     * @type {Ember.ComputedProperty<string>}
     */
    serviceType: computed('onepanelConfiguration.serviceType', function serviceType() {
      return this.get('onepanelServer').getClusterTypeFromUrl() ||
        this.get('onepanelConfiguration.serviceType');
    }),

    /**
     * Just an alias - this name was used in the past
     * @type {Ember.ComputedProperty<string>}
     */
    onepanelServiceType: reads('serviceType'),

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

    guiVersion: reads('onepanelConfiguration.version'),

    /**
     * @override
     */
    manageAccountExternalLink: computed(
      'onezoneGui.{onezoneGuiUrl,clusterUrlInOnepanel}',
      function manageAccountExternalLink() {
        const {
          onepanelServer,
          onezoneGui,
        } = this.getProperties('onepanelServer', 'onezoneGui');
        // FIXME: remove first option - go to onezone
        if (get(onepanelServer, 'isStandalone')) {
          return get(onezoneGui, 'clusterUrlInOnepanel');
        } else {
          const onezoneGuiUrl = get(onezoneGui, 'onezoneGuiUrl');
          return `${onezoneGuiUrl}/onedata/users`;
        }
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
        // FIXME: do not show in standalone mode
        if (get(onepanelServer, 'isStandalone')) {
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

    /**
     * @override
     */
    guiIcon: 'assets/images/onepanel-logo.svg',

    init() {
      this._super(...arguments);
      this.updateGuiNameProxy();
    },

    logout() {
      const session = this.get('session');
      return session.invalidate()
        .then(() => window.location.reload())
        .catch(error => {
          const {
            globalNotify,
            i18n,
          } = this.getProperties('globalNotify', 'i18n');
          globalNotify.backendError(
            i18n.t('components.userAccountButton.loggingOut'),
            error
          );
          throw error;
        });
    },

    fetchGuiName() {
      if (this.get('serviceType') === 'onezone') {
        return this.get('onepanelConfiguration').getConfigurationProxy()
          .then(config => get(config, 'zoneName'));
      } else {
        if (this.get('onepanelServer.isInitialized')) {
          return this.get('providerManager').getProviderDetails()
            .then(provider => provider && get(provider, 'name'));
        } else {
          return resolve(null);
        }
      }
    },
  });
