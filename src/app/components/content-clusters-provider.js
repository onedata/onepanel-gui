/**
 * A content page for managing registration data of provider
 *
 * @module components/content-clusters-provider
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

const {
  computed,
  Component,
  inject: { service },
} = Ember;

// TODO i18n
const FORM_TITLES = {
  show: `Registered provider details`,
  edit: `Modify registered provider details`,
  new: `Provider registration`,
};

const FORM_DESCRIPTIONS = {
  show: `This provider was registered with following data`,
  edit: `You can update registered provider details and submit the changes in form below`,
  new: `The provider is currently not registered in any Zone. Please enter details of provider for registration.`,
};

export default Component.extend({
  providerManager: service(),
  globalNotify: service(),

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

  // TODO i18n
  _editProviderButtonLabel: computed('_editing', function () {
    return this.get('_editing') ? 'Cancel modifying' : 'Modify provider details';
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

  // TODO i18n  
  _formTitle: computed('_providerFormMode', 'providerProxy.isFulfilled', function () {
    if (!this.get('providerProxy.isFulfilled')) {
      return '';
    } else {
      return FORM_TITLES[this.get('_providerFormMode')];
    }
  }),

  // TODO i18n  
  _formDescription: computed('_providerFormMode', 'providerProxy.isFulfilled', function () {
    if (!this.get('providerProxy.isFulfilled')) {
      return '';
    } else {
      return FORM_DESCRIPTIONS[this.get('_providerFormMode')];
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
        globalNotify.backendError('provider deregistration', error);
      });
      deregistering.then(() => {
        globalNotify.info('Provider has been deregistered');
        // TODO for now, we does not support not registered provider views
        setTimeout(() => window.location.reload(), 1000);
      });
      return deregistering;
    },

    /**
     * @param {Ember.Object} data
     * @param {string} data.name
     * @param {string} data.redirectionPoint
     * @param {number} data.geoLongitude
     * @param {number} data.getLatitude
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
        'name', 'redirectionPoint', 'geoLongitude', 'geoLatitude'
      );
      let modifying = providerManager.modifyProvider(modifyProviderData);
      modifying.catch(error => {
        // TODO i18n
        globalNotify.backendError('provider data modification', error);
        if (error && error.error && error.error === 'subdomainReserved') {
          this.set('_excludedSubdomains', _excludedSubdomains.concat(data.subdomain));
        }
      });
      modifying.then(() => {
        // TODO i18n
        globalNotify.info('Provider data has been modified');
        this._initProviderProxy(true);
        this.set('_editing', false);
      });
      return modifying;
    },
  },
});
