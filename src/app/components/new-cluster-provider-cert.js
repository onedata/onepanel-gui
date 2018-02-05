import Component from '@ember/component';
import { inject } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { default as EmberObject, computed, trySet } from '@ember/object';
import { dasherize, camelize } from '@ember/string';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import getSpecialLetsEncryptError from 'onepanel-gui/utils/get-special-lets-encrypt-error';
import changeDomain from 'onepanel-gui/utils/change-domain';

export default Component.extend(I18n, {
  providerManager: inject(),
  globalNotify: inject(),
  i18n: inject(),

  i18nPrefix: 'components.newClusterProviderCert',

  /**
   * @virtual
   * @type {function}
   */
  nextStep: undefined,

  /**
   * @type {PromiseObject<ProviderDetails>}
   */
  providerDetailsProxy: undefined,

  formValues: undefined,

  workProxy: undefined,

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
  _lockLetsEncrypt: computed.reads('_limitErrorOccured'),

  /**
   * True if the "Let's Encrypt Limit Error" has occured on current view
   * @type {boolean}
   */
  _limitErrorOccured: false,

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

  _providerDomain: computed.reads('providerDetailsProxy.domain'),

  _providerUrl: computed('_providerDomain', function _getProviderUrl() {
    return `https://${this.get('_providerDomain')}`;
  }),

  /**
   * True if currently making Let's Encrypt request
   * @type {Ember.ComputedProperty<boolean>}
   */
  isWorking: computed.reads('workProxy.isPending'),

  /**
   * True if Let's Encrypt toggle is on
   * @type {Ember.ComputedProperty<boolean>}
   */
  letsEncryptEnabled: computed.alias('formValues.letsEncryptEnabled'),

  /**
   * True if the user set subdomainDelegation option to true earlier
   * @type {Ember.ComputedProperty<true>}
   */
  subdomainDelegationEnabled: computed.reads(
    'providerDetailsProxy.content.subdomainDelegation'
  ),

  /**
   * One of: subdomain, noSubdomain
   * TODO: in future - handle let's encrypt limit exceeded
   * @type {string}
   */
  status: computed(
    'subdomainDelegationEnabled',
    function getStatus() {
      return this.get('subdomainDelegationEnabled') ? 'subdomain' : 'noSubdomain';
    }
  ),

  /**
   * Class of paragraph element for showing info
   * @type {Ember.ComputedProperty<string>}
   */
  textClass: computed('status', function getTextClass() {
    return 'text-' + dasherize(this.get('status'));
  }),

  /**
   * Label of main "next step" button
   * @type {Ember.ComputedProperty<string>}
   */
  btnLabel: computed('status', 'letsEncryptEnabled', function getBtnLabel() {
    switch (this.get('status')) {
      case 'subdomain':
        if (this.get('letsEncryptEnabled')) {
          return this.t('btnLabel.generate');
        } else {
          return this.t('btnLabel.skip');
        }
      case 'noSubdomain':
        return this.t('btnLabel.continue');
      default:
        break;
    }
  }),

  /**
   * Class of main "next step" button
   * @type {Ember.ComputedProperty<string>}
   */
  btnClass: computed('status', 'letsEncryptEnabled', function getBtnClass() {
    switch (this.get('status')) {
      case 'subdomain':
        if (this.get('letsEncryptEnabled')) {
          return 'btn-generate';
        } else {
          return 'btn-skip';
        }
      case 'noSubdomain':
        return 'btn-continue';
      default:
        break;
    }
  }),

  /**
   * @type {Ember.ComputedProperty<Array<FieldType>>}
   */
  formFields: computed(function getFormFields() {
    return [{
      name: 'letsEncryptEnabled',
      type: 'checkbox',
      label: this.t('letsEncryptToggle'),
    }];
  }),

  init() {
    this._super(...arguments);
    if (!this.get('providerDetailsProxy')) {
      this.set(
        'providerDetailsProxy',
        this.get('providerManager').getProviderDetails()
      );
    }
    if (!this.get('formValues')) {
      this.set('formValues', EmberObject.create({
        letsEncryptEnabled: true,
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
    return this.get('providerManager')
      .modifyProvider({
        letsEncryptEnabled: enabled,
      })
      .catch(error => {
        const errorType = getSpecialLetsEncryptError(error);
        if (errorType) {
          this.set(`_${camelize(errorType + 'ErrorOccured')}`, true);
          if (this.get('_lockLetsEncrypt')) {
            this.set('formValues.letsEncryptEnabled', false);
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
        const message = this.t(enabled ?
          'certificateGeneration' :
          'modifyProvider'
        );
        globalNotify.backendError(message, error);
        throw error;
      })
      .then(() => {
        if (enabled) {
          this.set('_redirectPage', true);
          const domain = this.get('providerDetailsProxy.content.domain');
          const _location = this.get('_location');
          globalNotify.success(this.t('generationSuccess'));
          this._changeDomain(domain, {
            location: _location,
            timeout: 5000,
          }).catch(() => trySet('_redirectPage', false));
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
      const {
        status,
        letsEncryptEnabled,
      } = this.getProperties('status', 'letsEncryptEnabled');
      switch (status) {
        case 'subdomain':
          {
            const promise = this._setLetsEncrypt(letsEncryptEnabled);
            this.set('workProxy', PromiseObject.create({ promise }));
            return promise;
          }
        case 'noSubdomain':
          return this.get('nextStep')();
        default:
          break;
      }
    },
  },
});
