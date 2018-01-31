/**
 * A content page for managing registration data of provider
 *
 * @module components/content-clusters-provider
 * @author Jakub Liput
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import getSubdomainReservedErrorMsg from 'onepanel-gui/utils/get-subdomain-reserved-error-msg';
import getSpecialLetsEncryptError from 'onepanel-gui/utils/get-special-lets-encrypt-error';
import { camelize } from '@ember/string';
import I18n from 'onedata-gui-common/mixins/components/i18n';

const {
  computed,
  Component,
  inject: { service },
} = Ember;

export default Component.extend(I18n, {
  providerManager: service(),
  globalNotify: service(),

  i18nPrefix: 'components.contentClustersProvider',

  /**
   * Initialized in ``_initProviderProxy``
   * @type {PromiseObject}
   */
  providerProxy: null,

  /**
   * Subdomains that are reserved and cannot be used
   * @type {Array<string>}
   */
  _excludedSubdomains: [],

  /**
   * @type {boolean}
   */
  _editing: false,

  /**
   * @type {boolean}
   */
  _deregisterModalOpen: false,

  _editProviderButtonType: computed('_editing', function () {
    return this.get('_editing') ? 'default' : 'primary';
  }),

  _editProviderButtonLabel: computed('_editing', function () {
    return this.get('_editing') ?
      this.t('cancelModifying') :
      this.t('modifyProviderDetails');
  }),

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

  _formDescription: computed('_providerFormMode', 'providerProxy.isFulfilled', function () {
    if (!this.get('providerProxy.isFulfilled')) {
      return '';
    } else {
      return this.t('formDescriptions.' + this.get('_providerFormMode'));
    }
  }),

  init() {
    this._super(...arguments);
    this._initProviderProxy();
  },

  _initProviderProxy(reload) {
    this.set('providerProxy', this.get('providerManager').getProviderDetails(reload));
  },

  actions: {
    toggleModifyProvider() {
      let _editing = this.get('_editing');
      if (_editing) {
        // cancelling
        this.set('_editing', false);
      } else {

        this.set('_editing', true);
      }
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
     * @returns {Promise}
     */
    deregister() {
      let {
        globalNotify,
        providerManager,
      } = this.getProperties('globalNotify', 'providerManager');
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
     * @param {string} data.letsEncryptEnabled
     * @param {string} data.subdomain
     * @param {number} data.geoLongitude
     * @param {number} data.getLatitude
     * @returns {Promise<any>} ProviderManager.modifyProvider promise
     */
    submitModify(data) {
      let {
        globalNotify,
        providerManager,
        _excludedSubdomains,
      } = this.getProperties(
        'globalNotify',
        'providerManager',
        '_excludedSubdomains'
      );
      let modifyProviderData = data.getProperties(
        'name',
        'subdomainDelegation',
        'subdomain',
        'domain',
        'letsEncryptEnabled',
        'adminEmail',
        'geoLongitude',
        'geoLatitude'
      );
      return providerManager.modifyProvider(modifyProviderData)
        .catch(error => {
          const subdomainReservedMsg = getSubdomainReservedErrorMsg(error);
          if (subdomainReservedMsg) {
            this.set('_excludedSubdomains', _excludedSubdomains.concat(data.subdomain));
            error = { error: error.error, message: subdomainReservedMsg };
          } else {
            const letsEncryptError = getSpecialLetsEncryptError(error);
            if (letsEncryptError) {
              error = {
                error: error.error,
                message: this.t(
                  'letsEncrypt.' + camelize(letsEncryptError + 'ErrorInfo')
                ),
              };
            }
          }
          globalNotify.backendError(this.t('providerDataModification'), error);
          throw error;
        })
        .then(() => {
          globalNotify.info(this.t('modifySuccess'));
          this._initProviderProxy(true);
          this.set('_editing', false);
        });
    },
  },
});
