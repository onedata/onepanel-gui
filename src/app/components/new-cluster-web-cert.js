/**
 * Setup step for configuring web certificate settings
 *
 * @module components/new-cluster-web-cert
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { reads, alias } from '@ember/object/computed';
import { default as EmberObject, computed, trySet, get } from '@ember/object';
import { camelize } from '@ember/string';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import getSpecialLetsEncryptError from 'onepanel-gui/utils/get-special-lets-encrypt-error';
import changeDomain from 'onepanel-gui/utils/change-domain';
import config from 'ember-get-config';

const {
  time: {
    redirectDomainDelay,
  },
} = config;

export default Component.extend(I18n, {
  classNames: ['new-cluster-web-cert'],

  onepanelServer: service(),
  clusterManager: service(),
  webCertManager: service(),
  globalNotify: service(),
  i18n: service(),

  i18nPrefix: 'components.newClusterWebCert',

  onepanelServiceType: reads('onepanelServer.serviceType'),

  /**
   * @virtual
   * @type {function}
   */
  nextStep: undefined,

  /**
   * @type {object} contains `letsEncrypt` property
   */
  formValues: undefined,

  /**
   * True if the "Let's Encrypt Limit Error" has occured on current view
   * @type {boolean}
   */
  _limitErrorOccured: false,

  /**
   * PromiseObject for requesting certificate data
   * @type {Promise}
   */
  workProxy: undefined,

  /**
   * @type {PromiseObject<Onepanel.WebCert>}
   */
  webCertProxy: computed(function webCertProxy() {
    const promise = this.get('webCertManager').getWebCert();
    return PromiseObject.create({ promise });
  }),

  /**
   * Using intermediate var for testing purposes
   * @type {Location}
   */
  _location: window.location,

  /**
   * True if the last Let's Encrypt has ended with known error
   * that says the Let's Encrypt is unavailable in this moment.
   * @type {boolean}
   */
  _lockLetsEncrypt: reads('_limitErrorOccured'),

  /**
   * True if the "Let's Encrypt Domain Error" has occured on current view
   * @type {boolean}
   */
  _authorizationErrorOccured: false,

  /**
   * Set to true if the location has been changed to show that location
   * change is pending
   * @type {boolean}
   */
  _redirectPage: false,

  /**
   * @type {Ember.ComputedProperty<PromiseObject<string|undefined>>}
   */
  _redirectDomain: computed('onepanelServiceType', function _redirectDomain() {
    const onepanelServiceType = this.get('onepanelServiceType');
    let promise;
    switch (onepanelServiceType) {
      case 'provider':
        promise = this.get('providerManager').getProviderDetails()
          .then(provider => provider && get(provider, 'domain'));
        break;
      case 'zone':
        promise = this.get('clusterManager').getConfiguration()
          .then(({ data: cluster }) => cluster && get(cluster, 'onezone.domainName'));
        break;
      default:
        throw new Error(`Invalid onepanelServiceType: ${onepanelServiceType}`);
    }
    return PromiseObject.create({ promise });
  }),

  /**
   * True if currently making Let's Encrypt request
   * @type {Ember.ComputedProperty<boolean>}
   */
  isWorking: reads('workProxy.isPending'),

  /**
   * True if Let's Encrypt toggle is on
   * @type {Ember.ComputedProperty<boolean>}
   */
  letsEncrypt: alias('formValues.letsEncrypt'),

  /**
   * Label of main "next step" button
   * @type {Ember.ComputedProperty<string>}
   */
  btnLabel: computed('letsEncrypt', function btnLabel() {
    return this.t(`btnLabel.${this.get('letsEncrypt') ? 'generate' : 'skip'}`);
  }),

  /**
   * Class of main "next step" button
   * @type {Ember.ComputedProperty<string>}
   */
  btnClass: computed('letsEncrypt', function btnClass() {
    return `btn-${this.get('letsEncrypt') ? 'generate' : 'skip'}`;
  }),

  /**
   * @type {Ember.ComputedProperty<Array<FieldType>>}
   */
  formFields: computed(function formFields() {
    return [{
      name: 'letsEncrypt',
      type: 'checkbox',
      label: this.t('letsEncryptToggle'),
    }];
  }),

  init() {
    this._super(...arguments);
    if (!this.get('formValues')) {
      this.set('formValues', EmberObject.create({
        letsEncrypt: true,
      }));
    }
  },

  /**
   * Alias for testing puproses
   * Using the same parameters as `util:changeDomain`
   * @returns {Promise} resolves after setting window.location
   */
  _changeDomain() {
    return changeDomain(...arguments);
  },

  /**
   * Configure Let's Encrypt feature for provider
   * @param {boolean} enabled 
   * @returns {Promise} invoke server `modifyProvider` method
   */
  _setLetsEncrypt(enabled) {
    const globalNotify = this.get('globalNotify');
    return this.get('webCertManager')
      .modifyWebCert({
        letsEncrypt: enabled,
      })
      .catch(error => {
        const errorType = getSpecialLetsEncryptError(error);
        if (errorType) {
          this.set(`_${camelize(errorType + 'ErrorOccured')}`, true);
          if (this.get('_lockLetsEncrypt')) {
            this.set('formValues.letsEncrypt', false);
          }
          error = {
            message: this.t('letsEncrypt.' + camelize(errorType + 'ErrorInfo')),
          };
        } else {
          this.setProperties({
            _authorizationErrorOccured: false,
            _limitErrorOccured: false,
            _lockLetsEncrypt: false,
          });
        }
        const message = this.t('certificateGeneration');
        globalNotify.backendError(message, error);
        throw error;
      })
      .then(() => {
        if (enabled) {
          this.set('_redirectPage', true);

          this.get('_redirectDomain')
            .then(domain => {
              const _location = this.get('_location');
              globalNotify.success(this.t('generationSuccess'));
              return this._changeDomain(domain, {
                location: _location,
                delay: redirectDomainDelay,
              });
            })
            .catch(() => trySet(this, '_redirectPage', false));
        } else {
          this.get('nextStep')();
        }
      });
  },

  actions: {
    changeFormValue(fieldName, value) {
      this.set(`formValues.${fieldName}`, value);
    },
    proceed() {
      const letsEncrypt = this.get('letsEncrypt');
      const promise = this._setLetsEncrypt(letsEncrypt);
      this.set('workProxy', PromiseObject.create({ promise }));
      return promise;
    },
  },
});
