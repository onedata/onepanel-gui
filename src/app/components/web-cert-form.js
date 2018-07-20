/**
 * A view to show or edit web certificate details
 *
 * @module components/web-cert-form
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, {
  computed,
  get,
} from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import OneForm from 'onedata-gui-common/components/one-form';
import _ from 'lodash';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';
import { buildValidations } from 'ember-cp-validations';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

const Validations = buildValidations({});

const staticFields = [{
    name: 'expirationTime',
    type: 'static',
    format: 'date',
  },
  {
    name: 'creationTime',
    type: 'static',
    format: 'date',
  },
  {
    name: 'domain',
    type: 'static',
  },
  {
    name: 'issuer',
    type: 'static',
  },
  {
    name: 'certPath',
    type: 'static',
  },
  {
    name: 'keyPath',
    type: 'static',
  },
  {
    name: 'chainPath',
    type: 'static',
  },
];

const letsEncryptInfoFields = [{
    name: 'lastRenewalSuccess',
    type: 'static',
    format: 'date',
  },
  {
    name: 'lastRenewalFailure',
    type: 'static',
    format: 'date',
  },
];

const letsEncryptField = {
  name: 'letsEncrypt',
  type: 'checkbox',
};

/**
 * Eg. certPath -> paths.cert
 * @param {string} fieldName
 * @returns {string}
 */
function pathFieldToProperty(fieldName) {
  return _.endsWith(fieldName, 'Path') ?
    `paths.${fieldName.replace(/Path$/, '')}` : fieldName;
}

export default OneForm.extend(I18n, Validations, {
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
   * @virtual
   * @type {boolean}
   */
  isEditing: false,

  /**
   * @virtual
   * @type {Function}
   */
  changeDomain: notImplementedReject,

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

  letsEncrypt: reads('webCert.letsEncrypt'),

  /**
   * @override
   */
  currentFieldsPrefix: computed(
    'isEditing',
    'letsEncrypt',
    function currentFieldsPrefix() {
      const {
        isEditing,
        letsEncrypt,
      } = this.getProperties('isEditing', 'letsEncrypt');
      const prefixes = [
        isEditing ? 'editLetsEncrypt' : 'showLetsEncrypt',
      ];
      if (letsEncrypt) {
        prefixes.push('letsEncryptInfoFields');
      }
      prefixes.push('staticFields');
      return prefixes;
    }),

  /**
   * @override
   * @type {Array<FieldType>}
   */
  allFields: computed(
    'letsEncryptEditField',
    'letsEncryptStaticField',
    'staticFields',
    'letsEncryptInfoFields',
    function () {
      return _.flatten(
        _.values(
          this.getProperties(
            'letsEncryptEditField',
            'letsEncryptStaticField',
            'letsEncryptInfoFields',
            'staticFields',
          )
        )
      );
    }
  ),

  /**
   * @override
   */
  allFieldsValues: computed(
    'webCert',
    'allFields',
    'isEditing',
    function allFieldsValues() {
      const webCert = this.get('webCert');
      const values = EmberObject.create({});

      values.set('showLetsEncrypt', EmberObject.create({
        letsEncrypt: get(webCert, 'letsEncrypt'),
      }));

      values.set('editLetsEncrypt', EmberObject.create({
        letsEncrypt: get(webCert, 'letsEncrypt'),
      }));

      const staticFieldsValues = values.set('staticFields', EmberObject.create());
      const letsEncryptInfoFieldsValues = values.set(
        'letsEncryptInfoFields',
        EmberObject.create()
      );

      /** @param {string} fieldName */
      staticFields.forEach(({ name: fieldName }) => {
        const value = get(
          webCert,
          pathFieldToProperty(fieldName),
        );
        staticFieldsValues.set(fieldName, value);
      });

      /** @param {string} fieldName */
      letsEncryptInfoFields.forEach(({ name: fieldName }) => {
        const value = get(
          webCert,
          pathFieldToProperty(fieldName),
        );
        letsEncryptInfoFieldsValues.set(fieldName, value);
      });

      return values;
    }),

  /**
   * Preprocessed fields objects
   * @type {Ember.ComputedProperty<Ember.Object>}
   */
  fieldsSource: computed(function fieldsSource() {
    const i18n = this.get('i18n');
    const tPrefix = 'components.webCertForm.fields.';
    const prepareField = (field) => _.assign({}, field, {
      label: i18n.t(tPrefix + field.name + '.label'),
      tip: field.tip ? i18n.t(tPrefix + field.name + '.tip') : undefined,
    });
    return EmberObject.create({
      letsEncryptField: prepareField(letsEncryptField),
      staticFields: staticFields.map(prepareField),
      letsEncryptInfoFields: letsEncryptInfoFields.map(prepareField),
    });
  }),

  /**
   * Static fields
   * @type {Ember.ComputedProperty<Array<Ember.Object>>}
   */
  staticFields: computed('fieldsSource.staticFields', 'webCert', function () {
    return this.get('fieldsSource.staticFields')
      .map(field => this.preprocessField(field, 'staticFields', true));
  }),

  letsEncryptInfoFields: computed(
    'fieldsSource.letsEncryptInfoFields',
    'webCert',
    function letsEncryptStaticFields() {
      return this.get('fieldsSource.letsEncryptInfoFields')
        .map(field => this.preprocessField(field, 'letsEncryptInfoFields', true));
    }
  ),

  /**
   * LE static field
   * @type {computed.Ember.Object}
   */
  letsEncryptStaticField: computed(
    'fieldsSource.letsEncryptField',
    'webCert',
    function letsEncryptStaticField() {
      return this.preprocessField(
        this.get('fieldsSource.letsEncryptField'),
        'showLetsEncrypt',
        true
      );
    }
  ),

  /**
   * LE edit field
   * @type {computed.Ember.Object}
   */
  letsEncryptEditField: computed(
    'fieldsSource.letsEncryptField',
    'webCert',
    function letsEncryptEditField() {
      return this.preprocessField(
        this.get('fieldsSource.letsEncryptField'),
        'editLetsEncrypt',
        false
      );
    }
  ),

  init() {
    this._super(...arguments);
    this.prepareFields();
  },

  /**
   * Performs initial field setup.
   * @param {FieldType} field Field
   * @param {string} prefix Field prefix
   * @param {boolean} isStatic Should field be static
   * @returns {object} prepared field
   */
  preprocessField(field, prefix, isStatic = false) {
    field = EmberObject.create(field);
    field.set('name', `${prefix}.${field.get('name')}`);
    if (isStatic) {
      field.set('type', 'static');
    }
    return field;
  },

  actions: {
    inputChanged(fieldName, value) {
      this.changeFormValue(fieldName, value);
    },

    focusOut(field) {
      field.set('changed', true);
      this.recalculateErrors();
    },

    submit() {
      const {
        formValues,
        currentFields,
      } = this.getProperties('formValues', 'currentFields');

      const letsEncrypt = get(formValues, 'editLetsEncrypt.letsEncrypt');

      const willChangeDomainAfterSubmit = get(
        _.find(currentFields, { name: 'editLetsEncrypt.letsEncrypt' }),
        'changed'
      ) && letsEncrypt;

      /** @type {Onepanel.WebCert} */
      const webCertChange = {
        letsEncrypt,
      };
      this.set('disabled', true);
      return this.get('submit')(webCertChange)
        .then(() => {
          if (willChangeDomainAfterSubmit) {
            this.get('changeDomain')();
          }
        })
        .catch(error => {
          this.get('globalNotify').backendError(
            this.t('modifyingWebCert'),
            error,
            ''
          );
        })
        .finally(() => {
          safeExec(this, 'set', 'disabled', false);
        });
    },
  },
});
