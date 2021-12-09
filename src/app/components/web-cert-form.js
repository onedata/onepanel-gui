/**
 * A view to show or edit web certificate details
 *
 * @module components/web-cert-form
 * @author Jakub Liput, Agnieszka Warchoł
 * @copyright (C) 2018-2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, get } from '@ember/object';
import { reads, not } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import _ from 'lodash';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import ToggleField from 'onedata-gui-common/utils/form-component/toggle-field';
import { tag, raw, conditional, notEqual, getBy, equal } from 'ember-awesome-macros';
import StaticTextField from 'onedata-gui-common/utils/form-component/static-text-field';
import DatetimeField from 'onedata-gui-common/utils/form-component/datetime-field';
import { scheduleOnce } from '@ember/runloop';
import computedT from 'onedata-gui-common/utils/computed-t';
import moment from 'moment';

/**
 * Eg. certPath -> paths.cert
 * @param {string} fieldName
 * @returns {string}
 */
function pathFieldToProperty(fieldName) {
  return _.endsWith(fieldName, 'Path') ?
    `paths.${fieldName.replace(/Path$/, '')}` : fieldName;
}

export default Component.extend(I18n, {
  classNames: ['web-cert-form'],

  i18n: service(),
  globalNotify: service(),
  guiUtils: service(),

  i18nPrefix: 'components.webCertForm',

  /**
   * @virtual
   * Contains webCert details (like ``Onepanel.WebCert``)
   * @type {Ember.Object}
   */
  webCert: undefined,

  /**
   * If true, all fields and submit button will be disabled
   * @type {boolean}
   */
  disabled: false,

  /**
   * Action called on form submit. Action arguments:
   * * formData {Object} data from form
   */
  submit: notImplementedReject,

  /**
   * If true, lets encrypt change modal is visible
   * @type {boolean}
   */
  showLetsEncryptChangeModal: false,

  /**
   * Currently displayed value of Let's Encrypt toggle
   * @type {Ember.ComputedProperty<boolean>}
   */
  formLetsEncryptValue: reads('fields.value.letsEncrypt'),

  /**
   * State of letsEncrypt configuration from backend.
   * This is not current state of form! It should be updated externally.
   * @type {Ember.ComputedProperty<boolean>}
   */
  letsEncrypt: reads('webCert.letsEncrypt'),
  
  /**
   * Domain of service for this onepanel
   * @type {String}
   */
  currentDomain: reads('guiUtils.serviceDomain'),

  /**
   * Time left until expired certificate
   * @type {String}
   */
  expirationTimeLeft: computed('webCert.expirationTime', function expirationTimeLeft() {
    const expirationTime = this.get('webCert.expirationTime');
    const timeLeft = moment(expirationTime).fromNow();
    if (timeLeft.includes('in')) {
      return timeLeft.replace('in ', '') + this.t('fields.expirationTime.left');
    } else {
      return timeLeft;
    }
  }),
    
  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsRootGroup>}
   */
  fields: computed(function fields() {
    const component = this;
    const {
      letsEncryptField,
      lastRenewalSuccess,
      lastRenewalFailure,
      expirationTimeField,
      creationTimeField,
      domainField,
      issuerField,
      certPathField,
      keyPathField,
      chainPathField,
    } = this.getProperties(
      'letsEncryptField',
      'lastRenewalSuccess',
      'lastRenewalFailure',
      'expirationTimeField',
      'creationTimeField',
      'domainField',
      'issuerField',
      'certPathField',
      'keyPathField',
      'chainPathField',
    );

    return FormFieldsRootGroup.extend({
      i18nPrefix: tag`${'component.i18nPrefix'}.fields`,
      ownerSource: reads('component'),
      isEnabled: not('component.disabled'),
      onValueChange(value, field) {
        this._super(...arguments);
        if (get(field, 'name') === 'letsEncrypt') {
          scheduleOnce('afterRender', component, 'notifyAboutChange');
        }
      },
    }).create({
      component,
      fields: [
        letsEncryptField,
        lastRenewalSuccess,
        lastRenewalFailure,
        expirationTimeField,
        creationTimeField,
        domainField,
        issuerField,
        certPathField,
        keyPathField,
        chainPathField,
      ],
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.ToggleField>}
   */
  letsEncryptField: computed(function letsEncryptField() {
    const component = this;
    return ToggleField.extend({
      defaultValue: component.computedDefaultValueFor('letsEncrypt'),
    }).create({
      component,
      name: 'letsEncrypt',
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.StaticTextField>}
   */
  lastRenewalSuccess: computed(function lastRenewalSuccess() {
    const component = this;
    return StaticTextField.extend({
      lastRenewal: component.computedDefaultValueFor('lastRenewalSuccess'),
      text: computed('lastRenewal', function text() {
        const lastRenewal = this.get('lastRenewal');
        if (lastRenewal) {
          return moment(this.get('lastRenewal')).format('YYYY-MM-DD [at] H:mm ([UTC]Z)');
        }
        return this.t('lastRenewalSuccess.never');
      }),
    }).create({
      component,
      name: 'lastRenewalSuccess',
    });
  }),
  
  /**
   * @type {ComputedProperty<Utils.FormComponent.StaticTextField>}
   */
  lastRenewalFailure: computed(function lastRenewalFailure() {
    const component = this;
    return StaticTextField.extend({
      lastRenewal: component.computedDefaultValueFor('lastRenewalFailure'),
      text: computed('lastRenewal', function text() {
        const lastRenewal = this.get('lastRenewal');
        if (lastRenewal) {
          return moment(this.get('lastRenewal')).format('YYYY-MM-DD [at] H:mm ([UTC]Z)');
        }
        return this.t('lastRenewalFailure.never');
      }),
    }).create({
      component,
      name: 'lastRenewalFailure',
    });
  }), 

  /**
   * @type {ComputedProperty<Utils.FormComponent.DatetimeField>}
   */
  expirationTimeField: computed(function expirationTimeField() {
    const component = this;
    return DatetimeField.extend({
      defaultValue: component.computedDefaultValueFor('expirationTime'),
      expirationTime: component.computedDefaultValueFor('expirationTime'),
      letsEncrypt: component.computedDefaultValueFor('letsEncrypt'),
      status: component.computedDefaultValueFor('status'),
      isNearExpiration: equal('status', raw('near_expiration')),
      isExpired: equal('status', raw('expired')),
      expirationTimeLeft: getBy(component, 'expirationTimeLeft'),
      isWarningTip: computed(
        'expirationTime',
        'letsEncrypt',
        'isNearExpiration',
        'isExpired',
        function isWarningTip() {
          const {
            letsEncrypt,
            expirationTime,
            isNearExpiration,
            isExpired,
          } = this.getProperties(
            'letsEncrypt',
            'expirationTime',
            'isNearExpiration',
            'isExpired'
          );
          const lessThenMonths = moment().add(3, 'months').diff(moment(expirationTime)) > 0;
          return (letsEncrypt && isNearExpiration && lessThenMonths) ||
            (!letsEncrypt && lessThenMonths) ||
            isExpired;
        }
      ),
      warningTip: conditional(
        equal('status', raw('expired')),
        computedT('expirationTime.warningTipExpired'),
        computedT('expirationTime.warningTip'),
      ),
      viewModeFormat: `YYYY-MM-DD [at] H:mm ([UTC]Z) [(${this.get('expirationTimeLeft')})]`,
      mode: 'view',
      classes: conditional(
        'isWarningTip',
        raw('warning-field'),
        raw(''),
      ),
      afterComponentName: conditional(
        'isWarningTip',
        raw('web-cert-form/warning-icon'),
        raw(undefined),
      ),
    }).create({
      component,
      name: 'expirationTime',
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.DatetimeField>}
   */
  creationTimeField: computed(function creationTimeField() {
    const component = this;
    return DatetimeField.extend({
      defaultValue: component.computedDefaultValueFor('creationTime'),
      viewModeFormat: 'YYYY-MM-DD [at] H:mm ([UTC]Z)',
      mode: 'view',
    }).create({
      component,
      name: 'creationTime',
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.StaticTextField>}
   */
  domainField: computed(function domainField() {
    const component = this;
    return StaticTextField.extend({
      text: component.computedDefaultValueFor('domain'),
      warningTip: computedT('domain.warningTip'),
      classes: conditional(
        notEqual('component.webCert.domain', ('component.guiUtils.serviceDomain')),
        raw('warning-field'),
        raw('')
      ),
      afterComponentName: conditional(
        notEqual('component.webCert.domain', ('component.guiUtils.serviceDomain')),
        raw('web-cert-form/warning-icon'),
        raw(undefined),
      ),
    }).create({
      component,
      name: 'domain',
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.StaticTextField>}
   */
  issuerField: computed(function issuerField() {
    const component = this;
    return StaticTextField.extend({
      text: component.computedDefaultValueFor('issuer'),
    }).create({
      component,
      name: 'issuer',
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.StaticTextField>}
   */
  certPathField: computed(function certPathField() {
    const component = this;
    return StaticTextField.extend({
      text: component.computedDefaultValueFor('certPath'),
    }).create({
      component,
      name: 'certPath',
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.StaticTextField>}
   */
  keyPathField: computed(function keyPathField() {
    const component = this;
    return StaticTextField.extend({
      text: component.computedDefaultValueFor('keyPath'),
    }).create({
      component,
      name: 'keyPath',
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.StaticTextField>}
   */
  chainPathField: computed(function chainPathField() {
    const component = this;
    return StaticTextField.extend({
      text: component.computedDefaultValueFor('chainPath'),
    }).create({
      component,
      name: 'chainPath',
    });
  }),

  computedDefaultValueFor(fieldName) {
    return getBy('component.webCert', raw(pathFieldToProperty(fieldName)));
  },

  notifyAboutChange() {
    this.set('showLetsEncryptChangeModal', true);
  },

  actions: {
    submit() {
      const {
        formLetsEncryptValue,
        letsEncrypt,
        submit,
      } = this.getProperties('fields', 'formLetsEncryptValue', 'letsEncrypt', 'submit');

      const willReloadAfterSubmit =
        formLetsEncryptValue !== letsEncrypt &&
        formLetsEncryptValue;
 
      /** @type {Onepanel.WebCert} */
      const webCertChange = {
        letsEncrypt: formLetsEncryptValue,
      };
      this.set('disabled', true);
      return submit(webCertChange, willReloadAfterSubmit)
        .catch(error => {
          this.get('globalNotify').backendError(
            this.t('modifyingWebCert'),
            error,
            ''
          );
        })
        .finally(() => {
          safeExec(this, 'setProperties', {
            disabled: false,
            showLetsEncryptChangeModal: false,
          });
        });
    },

    changedModalCanceled() {
      const letsEncrypt = this.get('letsEncrypt');
      this.set('fields.value.letsEncrypt', letsEncrypt);
      this.set('showLetsEncryptChangeModal', false);
    },
  },
});
