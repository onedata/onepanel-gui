/**
 * A view to show or edit web certificate details
 *
 * @author Jakub Liput, Agnieszka Warchoł
 * @copyright (C) 2018-2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, get } from '@ember/object';
import { reads, not } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import _ from 'lodash';
import I18n from 'onedata-gui-common/mixins/i18n';
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import ToggleField from 'onedata-gui-common/utils/form-component/toggle-field';
import {
  tag,
  raw,
  conditional,
  equal,
} from 'ember-awesome-macros';
import StaticTextField from 'onedata-gui-common/utils/form-component/static-text-field';
import StaticListField from 'onedata-gui-common/utils/form-component/static-list-field';
import DatetimeField from 'onedata-gui-common/utils/form-component/datetime-field';
import { scheduleOnce } from '@ember/runloop';
import computedT from 'onedata-gui-common/utils/computed-t';
import moment from 'moment';
import { capitalize } from '@ember/string';
import { ListFieldComponent } from 'onedata-gui-common/utils/form-component/static-list-field';

const DATE_FORMAT = 'YYYY-MM-DD [at] H:mm ([UTC]Z)';

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
  webCertManager: service(),

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
   * Action called on form submit.
   * @type {(formData: Object) => Promise<void>}
   */
  onSubmit: notImplementedReject,

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
   * Service type for this onepanel
   * @type {String}
   */
  currentServiceType: reads('guiUtils.serviceType'),

  domainWarningTip: computed(
    'currentDomain',
    'currentServiceType',
    // used by: this.webCertManager.isWebCertDomainValid
    'webCert.dnsNames',
    'guiUtils.serviceDomain',
    function domainWarningTip() {
      if (this.webCertManager.isWebCertDomainValid(this.webCert)) {
        return;
      }
      const {
        currentDomain,
        currentServiceType,
      } = this;
      return this.t('fields.dnsNames.warningTip', {
        currentServiceType: capitalize(currentServiceType),
        currentDomain,
      });
    }
  ),

  domainWarningText: computedT('fields.dnsNames.noneMatchWarning'),

  /**
   * Time left until expired certificate
   * @type {String}
   */
  expirationTimeLeft: computed('webCert.expirationTime', function expirationTimeLeft() {
    const expirationTime = moment(this.get('webCert.expirationTime'));
    if (expirationTime.diff(moment()) > 0) {
      return expirationTime.fromNow(true) + this.t('fields.expirationTime.left');
    } else {
      return expirationTime.fromNow();
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
      dnsNamesField,
      issuerField,
      certPathField,
      keyPathField,
      chainPathField,
    } = this;

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
        dnsNamesField,
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
          return moment(lastRenewal).format(DATE_FORMAT);
        }
        return this.t('lastRenewalSuccess.never');
      }),
      mode: 'view',
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
          return moment(lastRenewal).format(DATE_FORMAT);
        }
        return this.t('lastRenewalFailure.never');
      }),
      mode: 'view',
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
      hasWarningTip: computed(
        'expirationTime',
        'letsEncrypt',
        'isNearExpiration',
        'isExpired',
        function hasWarningTip() {
          const {
            letsEncrypt,
            expirationTime,
            isNearExpiration,
            isExpired,
          } = this;
          const lessThenMonths = moment().add(21, 'days').diff(moment(expirationTime)) > 0;
          return (letsEncrypt && isNearExpiration && lessThenMonths) ||
            (!letsEncrypt && lessThenMonths) ||
            isExpired;
        }
      ),
      warningTip: conditional(
        equal('status', raw('expired')),
        computedT('expirationTime.warningTipExpired'),
        computedT('expirationTime.warningTipNearExpiration'),
      ),
      viewModeFormat: tag `YYYY-MM-DD [at] H:mm ([UTC]Z) [(${'component.expirationTimeLeft'})]`,
      mode: 'view',
      classes: conditional(
        'hasWarningTip',
        raw('warning-field'),
        raw(''),
      ),
      afterComponentName: conditional(
        'hasWarningTip',
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
      viewModeFormat: DATE_FORMAT,
      mode: 'view',
    }).create({
      component,
      name: 'creationTime',
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.StaticTextField>}
   */
  dnsNamesField: computed(function dnsNamesField() {
    const component = this;
    return StaticListField.extend({
      dnsNames: component.computedDefaultValueFor('dnsNames'),
      value: computed('dnsNames', 'warningTip', function value() {
        const items = sortDnsNames(this.dnsNames);
        if (this.warningTip) {
          items.push(new ListFieldComponent('web-cert-form/warning-item'));
        }
        return items;
      }),
      /** for warning-item */
      warningTip: reads('component.domainWarningTip'),
      /** for warning-item */
      warningText: reads('component.domainWarningText'),
      mode: 'view',
    }).create({
      component,
      name: 'dnsNames',
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.StaticTextField>}
   */
  issuerField: computed(function issuerField() {
    const component = this;
    return StaticTextField.extend({
      text: component.computedDefaultValueFor('issuer'),
      mode: 'view',
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
      mode: 'view',
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
      mode: 'view',
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
      mode: 'view',
    }).create({
      component,
      name: 'chainPath',
    });
  }),

  /**
   * @override
   */
  willDestroy() {
    try {
      this.cacheFor('fields')?.destroy();
    } finally {
      this._super(...arguments);
    }
  },

  computedDefaultValueFor(fieldName) {
    return reads(`component.webCert.${pathFieldToProperty(fieldName)}`);
  },

  notifyAboutChange() {
    this.set('showLetsEncryptChangeModal', true);
  },

  actions: {
    async submit() {
      const {
        formLetsEncryptValue,
        letsEncrypt,
        onSubmit,
        globalNotify,
      } = this;

      const willReloadAfterSubmit =
        formLetsEncryptValue !== letsEncrypt &&
        formLetsEncryptValue;

      /** @type {Onepanel.WebCert} */
      const webCertChange = {
        letsEncrypt: formLetsEncryptValue,
      };
      this.set('disabled', true);

      try {
        await onSubmit(webCertChange, willReloadAfterSubmit);
      } catch (error) {
        globalNotify.backendError(
          this.t('modifyingWebCert'),
          error,
          ''
        );
      } finally {
        safeExec(this, 'setProperties', {
          disabled: false,
          showLetsEncryptChangeModal: false,
        });
      }
    },

    changedModalCanceled() {
      const letsEncrypt = this.get('letsEncrypt');
      this.set('fields.value.letsEncrypt', letsEncrypt);
      this.set('showLetsEncryptChangeModal', false);
    },
  },
});

function sortDnsNames(dnsNames) {
  const sortableNamesData = dnsNames.map(dnsName => ({
    name: dnsName,
    segmentsCount: dnsName.split('.').length,
  }));
  return _.orderBy(sortableNamesData, ['segmentsCount', 'dnsName'], ['asc', 'desc'])
    .map(({ name }) => name);
}
