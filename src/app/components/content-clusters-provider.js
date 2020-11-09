/**
 * A content page for managing registration data of provider
 *
 * @module components/content-clusters-provider
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { next } from '@ember/runloop';
import extractNestedError from 'onepanel-gui/utils/extract-nested-error';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import GlobalActions from 'onedata-gui-common/mixins/components/global-actions';
import { get } from '@ember/object';
import { reads } from '@ember/object/computed';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import { Promise } from 'rsvp';
import computedT from 'onedata-gui-common/utils/computed-t';

export default Component.extend(
  I18n,
  GlobalActions,
  createDataProxyMixin('onezoneInfo'),
  createDataProxyMixin('provider'), {
    providerManager: service(),
    onepanelServer: service(),
    globalNotify: service(),
    i18n: service(),
    onezoneGui: service(),
    guiUtils: service(),
    clusterModelManager: service(),

    /**
     * @override
     */
    i18nPrefix: 'components.contentClustersProvider',

    /**
     * @override
     */
    globalActionsTitle: computedT('globalActionsTitle'),

    /**
     * @virtual
     */
    cluster: undefined,

    /**
     * Subdomains that are reserved and cannot be used
     * @type {Array<string>}
     */
    _excludedSubdomains: Object.freeze([]),

    /**
     * @type {boolean}
     */
    _editing: false,

    /**
     * @type {boolean}
     */
    _submitting: false,

    /**
     * @type {boolean}
     */
    _deregisterModalOpen: false,

    /**
     * @type {string}
     */
    _deregisterPopoverSelector: '',

    /**
     * If true, show blocking modal with link to configure web cert
     */
    showConfigureWebCertModal: false,

    /**
     * @type {Ember.ComputedProperty<boolean>}
     */
    _editButtonEnabled: computed.not('_submitting'),

    /**
     * @type {Ember.ComputedProperty<boolean>}
     */
    isOnepanelEmergency: reads('onepanelServer.isEmergency'),

    /**
     * @override
     * @returns {Promise<Onepanel.OnezoneInfo>}
     */
    fetchOnezoneInfo() {
      const onepanelServer = this.get('onepanelServer');
      return onepanelServer.request('OneproviderIdentityApi', 'getOnezoneInfo', {})
        .then(({ data }) => data);
    },

    /**
     * @override
     * @returns {Promise<Onepanel.OnezoneInfo>}
     */
    fetchProvider() {
      return this.get('providerManager').getProviderDetailsProxy({ reload: true });
    },

    _providerFormMode: computed('_editing', 'providerProxy.content', function () {
      let _editing = this.get('_editing');
      let provider = this.get('providerProxy.content');
      if (provider != null) {
        return _editing ? 'edit' : 'show';
      } else {
        return 'new';
      }
    }),

    _formTitle: computed('_providerFormMode', 'providerProxy.isFulfilled', function () {
      if (!this.get('providerProxy.isFulfilled')) {
        return '';
      } else {
        return this.t('formTitles.' + this.get('_providerFormMode'));
      }
    }),

    _formDescription: computed('_providerFormMode', 'providerProxy.isFulfilled',
      function () {
        if (!this.get('providerProxy.isFulfilled')) {
          return '';
        } else {
          return this.t('formDescriptions.' + this.get('_providerFormMode'));
        }
      }),

    /**
     * @type {Ember.ComputedProperty<Action>}
     */
    _openDeregisterAction: computed(function () {
      return {
        action: () =>
          this.send(
            this.get('isOnepanelEmergency') ?
            'openDeregisterModal' :
            'deregisterInOnezone'
          ),
        title: this.t('deregisterProvider'),
        class: 'btn-deregister-provider',
        buttonStyle: 'danger',
      };
    }),

    /**
     * @type {Ember.ComputedProperty<Action>}
     */
    _toggleModifyProviderAction: computed('_editing', function () {
      const _editing = this.get('_editing');
      return {
        action: () => this.send('toggleModifyProvider'),
        title: this.t(_editing ? 'cancelModifying' : 'modifyProviderDetails'),
        class: 'btn-modify-provider',
        buttonStyle: _editing ? 'default' : 'primary',
      };
    }),

    /**
     * @override 
     * @type {Ember.ComputedProperty<Array<Action>>}
     */
    globalActions: computed(
      '_openDeregisterAction',
      '_toggleModifyProviderAction',
      function () {
        const {
          _openDeregisterAction,
          _toggleModifyProviderAction,
        } = this.getProperties(
          '_openDeregisterAction',
          '_toggleModifyProviderAction'
        );
        return [_openDeregisterAction, _toggleModifyProviderAction];
      }
    ),

    init() {
      this._super(...arguments);
      this.updateOnezoneInfoProxy();
      this.updateProviderProxy();
      next(() => safeExec(
        this,
        'set',
        '_deregisterPopoverSelector',
        '.btn-deregister-provider.btn;a.btn-deregister-provider:modal'
      ));
    },

    redirectToDeregisterInOnezone() {
      const clusterId = this.get('cluster.id');
      window.location = this.get('onezoneGui')
        .getUrlInOnezone(`onedata/clusters/${clusterId}/deregister`);
    },

    actions: {
      toggleModifyProvider() {
        this.toggleProperty('_editing');
      },

      deregisterInOnezone() {
        return new Promise(() => this.redirectToDeregisterInOnezone());
      },

      openDeregisterModal(fromFullToolbar) {
        if (!fromFullToolbar) {
          this.set('_deregisterModalOpen', true);
        }
      },

      closeDeregisterModal() {
        this.set('_deregisterModalOpen', false);
      },

      /**
       * Deregister Oneprovider from Onezone via Onepanel API
       * @returns {Promise}
       */
      deregister() {
        let {
          globalNotify,
          providerManager,
        } = this.getProperties(
          'globalNotify',
          'providerManager',
        );
        let deregistering = providerManager.deregisterProvider();
        deregistering.catch(error => {
          globalNotify.backendError(this.t('providerDeregistration'), error);
        });
        deregistering.then(() => {
          globalNotify.info(this.t('deregisterSuccess'));
          setTimeout(() => window.location.reload(), 1000);
        });
        return deregistering;
      },

      /**
       * @param {Ember.Object} data
       * @param {string} data.name
       * @param {boolean} data.subdomainDelegation
       * @param {string} data.domain
       * @param {string} data.subdomain
       * @param {number} data.geoLongitude
       * @param {number} data.getLatitude
       * @returns {Promise<any>} ProviderManager.modifyProvider promise
       */
      submitModify(data) {
        const {
          globalNotify,
          providerManager,
          _excludedSubdomains,
        } = this.getProperties(
          'globalNotify',
          'providerManager',
          '_excludedSubdomains'
        );
        const modifyProviderData = data.getProperties(
          'name',
          'subdomainDelegation',
          'subdomain',
          'domain',
          'adminEmail',
          'geoLongitude',
          'geoLatitude'
        );
        this.set('_submitting', true);
        return providerManager.modifyProvider(modifyProviderData)
          .catch(errorResponse => {
            const nestedError = extractNestedError(
              get(errorResponse, 'response.body.error')
            );
            const isSubdomainReservedError = nestedError &&
              get(nestedError, 'id') === 'badValueIdentifierOccupied' &&
              get(nestedError, 'details.key') === 'subdomain';
            if (isSubdomainReservedError) {
              safeExec(
                this,
                'set',
                '_excludedSubdomains',
                _excludedSubdomains.concat(data.subdomain)
              );
            }
            globalNotify.backendError(
              this.t('providerDataModification'),
              errorResponse
            );
            throw errorResponse;
          })
          .then(() => {
            globalNotify.info(this.t('modifySuccess'));
            safeExec(this, 'set', '_editing', false);
            return this.updateProviderProxy();
          })
          .finally(() => {
            safeExec(this, 'set', '_submitting', false);
            const {
              guiUtils,
              clusterModelManager,
            } = this.getProperties('guiUtils', 'clusterModelManager');
            return guiUtils.updateGuiNameProxy({ replace: true })
              .then(() => clusterModelManager.updateClustersProxy({
                replace: true,
              }));
          });
      },

      changeDomain() {
        this.set('showConfigureWebCertModal', true);
      },
    },
  });
