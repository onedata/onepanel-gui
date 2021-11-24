/**
 * A view to show or edit web certificate details
 *
 * @module components/web-cert-form
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, get, getProperties } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import _ from 'lodash';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import ToggleField from 'onedata-gui-common/utils/form-component/toggle-field';
import { tag } from 'ember-awesome-macros';
import StaticTextField from 'onedata-gui-common/utils/form-component/static-text-field';
import { scheduleOnce } from '@ember/runloop';

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
  formLetsEncryptValue: reads('webCert.letsEncrypt'),

  /**
   * State of letsEncrypt configuration from backend.
   * This is not current state of form! It should be updated externally.
   * @type {Ember.ComputedProperty<boolean>}
   */
  letsEncrypt: reads('webCert.letsEncrypt'),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsRootGroup>}
   */
  fields: computed(function fields() {
    const component = this;
    const {
      letsEncryptField,
      expirationTimeField,
      creationTimeField,
      domainField,
      issuerField,
      certPathField,
      keyPathField,
      chainPathField,
      disabled,
    } = this.getProperties(
      'letsEncryptField',
      'expirationTimeField',
      'creationTimeField',
      'domainField',
      'issuerField',
      'certPathField',
      'keyPathField',
      'chainPathField',
      'disabled',
    );

    return FormFieldsRootGroup.extend({
      i18nPrefix: tag `${'component.i18nPrefix'}.fields`,
      ownerSource: reads('component'),
      isEnabled: !disabled,
      onValueChange(value, field) {
        this._super(...arguments);
        if (field.get('name') === 'letsEncrypt') {
          scheduleOnce('afterRender', component, 'notifyAboutChange', value);
        }
        
      },
    }).create({
      component,
      fields: [
        letsEncryptField,
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

  letsEncryptField: computed('webCert', function letsEncryptField() {
    const component = this;
    const webCert = this.get('webCert');
    return ToggleField.extend({
      defaultValue: get(
          webCert,
          pathFieldToProperty('letsEncrypt'),
        ),
    }).create({
      component,
      name: 'letsEncrypt',
    });
  }),

  notifyAboutChange(value) {
    this.set('formLetsEncryptValue', value);
    this.set('showLetsEncryptChangeModal', true);
    safeExec(this, () => {
      const {
        fields,
        onChange,
      } = this.getProperties('fields', 'onChange');

      const {
        isValid,
        invalidFields,
      } = getProperties(fields, 'isValid', 'invalidFields');

      onChange({
        values: fields.dumpValue(),
        isValid,
        invalidFields: invalidFields.mapBy('valuePath'),
      });
    });
  },

  expirationTimeField: computed('webCert', function expirationTimeField() {
    const component = this;
    const webCert = this.get('webCert');
    return StaticTextField.extend({
      text: get(
          webCert,
          pathFieldToProperty('expirationTime'),
        ),
    }).create({
      component,
      name: 'expirationTime',
    });
  }),

  creationTimeField: computed('webCert', function creationTimeField() {
    const component = this;
    const webCert = this.get('webCert');
    return StaticTextField.extend({
      text: get(
          webCert,
          pathFieldToProperty('creationTime'),
        ),
    }).create({
      component,
      name: 'creationTime',
    });
  }),

  domainField: computed('webCert', function domainField() {
    const component = this;
    const webCert = this.get('webCert');
    return StaticTextField.extend({
      text: get(
          webCert,
          pathFieldToProperty('domain'),
        ),
    }).create({
      component,
      name: 'domain',
    });
  }),

  issuerField: computed('webCert', function issuerField() {
    const component = this;
    const webCert = this.get('webCert');
    return StaticTextField.extend({
      text: get(
          webCert,
          pathFieldToProperty('issuer'),
        ),
    }).create({
      component,
      name: 'issuer',
    });
  }),

  certPathField: computed('webCert', function certPathField() {
    const component = this;
    const webCert = this.get('webCert');
    return StaticTextField.extend({
      text: get(
          webCert,
          pathFieldToProperty('certPath'),
        ),
    }).create({
      component,
      name: 'certPath',
    });
  }),

  keyPathField: computed('webCert', function keyPathField() {
    const component = this;
    const webCert = this.get('webCert');
    return StaticTextField.extend({
      text: get(
          webCert,
          pathFieldToProperty('keyPath'),
        ),
    }).create({
      component,
      name: 'keyPath',
    });
  }),

  chainPathField: computed('webCert', function chainPathField() {
    const component = this;
    const webCert = this.get('webCert');
    return StaticTextField.extend({
      text: get(
          webCert,
          pathFieldToProperty('chainPath'),
        ),
    }).create({
      component,
      name: 'chainPath',
    });
  }),

  init() {
    this._super(...arguments);
  },

  actions: {
    submit() {
      const {
        fields,
        formLetsEncryptValue,
        letsEncrypt,
        submit,
      } = this.getProperties('fields', 'formLetsEncryptValue', 'letsEncrypt', 'submit');

      console.log(fields);
      const willReloadAfterSubmit = formLetsEncryptValue !== letsEncrypt;
 
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
