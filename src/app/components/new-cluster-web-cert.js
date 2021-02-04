/**
 * Setup step for configuring web certificate settings
 *
 * @module components/new-cluster-web-cert
 * @author Jakub Liput
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { reads, alias } from '@ember/object/computed';
import { default as EmberObject, computed, get, trySet } from '@ember/object';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import config from 'ember-get-config';
import changeDomain from 'onepanel-gui/utils/change-domain';

const {
  time: {
    reloadDelayForCertificateChange,
  },
} = config;

export default Component.extend(I18n, {
  classNames: ['new-cluster-web-cert'],

  onepanelServer: service(),
  deploymentManager: service(),
  webCertManager: service(),
  providerManager: service(),
  globalNotify: service(),
  i18n: service(),
  guiUtils: service(),

  i18nPrefix: 'components.newClusterWebCert',

  onepanelServiceType: reads('guiUtils.serviceType'),

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
   * PromiseObject for requesting certificate data
   * @type {Promise}
   */
  workProxy: undefined,

  /**
   * @type {PromiseObject<Onepanel.WebCert>}
   */
  webCertProxy: computed(function webCertProxy() {
    const promise = this.get('webCertManager').fetchWebCert();
    return PromiseObject.create({ promise });
  }),

  /**
   * Using intermediate var for testing purposes
   * @type {Location}
   */
  _location: location,

  /**
   * Set to true if the location has been changed to show that location
   * change is pending
   * @type {boolean}
   */
  _redirectPage: false,

  /**
   * @type {ComputedProperty<PromiseObject<String|undefined>>}
   */
  redirectDomain: computed('onepanelServiceType', function redirectDomain() {
    const onepanelServiceType = this.get('onepanelServiceType');
    let promise;
    switch (onepanelServiceType) {
      case 'oneprovider':
        promise = this.get('providerManager').getProviderDetailsProxy()
          .then(provider => provider && get(provider, 'domain'));
        break;
      case 'onezone':
        promise = this.get('deploymentManager').getClusterConfiguration()
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
   * Configure Let's Encrypt feature for provider
   * @param {boolean} enabled 
   * @returns {Promise} invoke server `modifyProvider` method
   */
  _setLetsEncrypt(enabled) {
    const {
      globalNotify,
      webCertManager,
    } = this.getProperties('globalNotify', 'webCertManager');
    return webCertManager.modifyWebCert({ letsEncrypt: enabled })
      .catch(error => {
        globalNotify.backendError(this.t('certificateGeneration'), error);
        throw error;
      })
      .then(() => {
        if (enabled) {
          this.set('_redirectPage', true);
          this.get('redirectDomain')
            .then(domain => changeDomain(domain, {
              location: this.get('_location'),
              delay: reloadDelayForCertificateChange,
            }))
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
