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
import { default as EmberObject, computed, trySet } from '@ember/object';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';

export default Component.extend(I18n, {
  classNames: ['new-cluster-web-cert'],

  webCertManager: service(),
  globalNotify: service(),
  i18n: service(),
  guiUtils: service(),

  i18nPrefix: 'components.newClusterWebCert',

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
   * Set to true if the location has been changed to show that location
   * change is pending
   * @type {boolean}
   */
  _redirectPage: false,

  /**
   * @type {ComputedProperty<String>}
   */
  onepanelServiceType: reads('guiUtils.serviceType'),

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
          return webCertManager.reloadPageAfterWebCertChange()
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
