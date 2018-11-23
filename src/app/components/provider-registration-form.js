/**
 * A view to create, show or edit registered provider details
 *
 * @module components/provider-registration-form
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { readOnly } from '@ember/object/computed';

import { next, scheduleOnce } from '@ember/runloop';
import EmberObject, {
  set,
  get,
  observer,
  computed,
} from '@ember/object';
import { inject as service } from '@ember/service';

import OneForm from 'onedata-gui-common/components/one-form';
import simplifyString from 'onedata-gui-common/utils/simplify-string';
import { validator, buildValidations } from 'ember-cp-validations';
import createFieldValidator from 'onedata-gui-common/utils/create-field-validator';
import _ from 'lodash';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';

const DOMAIN_REGEX =
  /^(([a-z0-9]|[a-z0-9][a-z0-9-]*[a-z0-9])\.)*([a-z0-9]|[a-z0-9][a-z0-9-]*[a-z0-9])$/;
const SUBDOMAIN_REGEX = /^([a-z0-9]|[a-z0-9][a-z0-9-]*[a-z0-9])$/;

const EMAIL_REGEX =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const COMMON_FIELDS_TOP = [{
    name: 'id',
    type: 'static',
  },
  {
    name: 'name',
    type: 'text',
    example: 'My provider',
  },
  {
    name: 'onezoneDomainName',
    type: 'text',
    example: 'my-onezone.com',
  },
  {
    name: 'subdomainDelegation',
    type: 'checkbox',
    defaultValue: true,
    tip: true,
  },
];

const TOKEN_FIELD = {
  name: 'token',
  type: 'text',
  tip: true,
  example: 'EDDSA9q89dq8q93t326895639ete0eyd7ft67rt789y4q78f90muy8qf9yq478r',
};

const HOSTNAME_FIELD = {
  name: 'domain',
  type: 'text',
  regex: DOMAIN_REGEX,
  tip: true,
  example: 'my-provider.com',
};

const SUBDOMAIN_FIELD = {
  name: 'subdomain',
  type: 'text',
  regex: SUBDOMAIN_REGEX,
  tip: true,
  example: 'my-provider',
};

const COMMON_FIELDS_BOTTOM = [{
    name: 'adminEmail',
    type: 'text',
    regex: EMAIL_REGEX,
    tip: true,
    example: 'admin@example.com',
  }, {
    name: 'geoLatitude',
    type: 'number',
    step: 0.000001,
    lte: 90,
    gte: -90,
    optional: true,
    example: '50.068940',
  },
  {
    name: 'geoLongitude',
    type: 'number',
    label: 'Longitude',
    step: 0.000001,
    lte: 180,
    gte: -180,
    optional: true,
    example: '19.909213',
  },
];

const VALIDATIONS_PROTO = {};
const FIELDS_PREFIXES = [
  { fields: [TOKEN_FIELD], prefix: 'newToken' },
  { fields: COMMON_FIELDS_TOP, prefix: 'editTop' },
  { fields: [HOSTNAME_FIELD], prefix: 'editDomain' },
  { fields: [SUBDOMAIN_FIELD], prefix: 'editSubdomain' },
  { fields: COMMON_FIELDS_BOTTOM, prefix: 'editBottom' },
];

FIELDS_PREFIXES.forEach(({ fields, prefix }) => {
  fields.forEach((field) => {
    const validators = createFieldValidator(field);
    if (field.name === 'subdomain') {
      validators.push(
        validator(
          'exclusion', { in: readOnly('model.excludedSubdomains'),
            message: computed(function () {
              return this.get('model.i18n')
                .t('components.providerRegistrationForm.subdomainReserved');
            }),
          }
        )
      );
    }
    VALIDATIONS_PROTO[`allFieldsValues.${prefix}.${field.name}`] = validators;
  });
});

// validate onezoneDomainName only in "new" mode
VALIDATIONS_PROTO['allFieldsValues.editTop.onezoneDomainName'] = [
  validator('presence', {
    presence: true,
    ignoreBlank: true,
    disabled: computed('model.mode', function () {
      return this.get('model.mode') !== 'new';
    }),
  }),
  validator('format', {
    regex: DOMAIN_REGEX,
    allowBlank: true,
  }),
];

const Validations = buildValidations(VALIDATIONS_PROTO);
const ALL_PREFIXES = [
  'newToken',
  'editTop',
  'editBottom',
  'editDomain',
  'editSubdomain',
  'showTop',
  'showBottom',
  'showDomain',
  'showSubdomain',
];

export default OneForm.extend(Validations, I18n, {
  classNames: ['provider-registration-form'],

  i18n: service(),
  webCertManager: service(),

  i18nPrefix: 'components.providerRegistrationForm',

  /**
   * @virtual optional
   * @type {string}
   */
  token: undefined,

  /**
   * @virtual
   * @type {string}
   */
  subdomainDelegation: undefined,

  /**
   * @virtual
   * @type {string}
   */
  onezoneDomain: undefined,

  /**
   * To inject. One of: show, edit, new
   *
   * Use to set form to work in various contexts
   * @type {string}
   */
  mode: 'show',

  /**
   * To inject.
   * Contains provider registration info (like ``Onepanel.ProviderDetails``)
   * @type {Ember.Object}
   */
  provider: null,

  /**
   * Subdomains that cannot be used.
   * @virtual
   * @type {Array<string>}
   */
  excludedSubdomains: Object.freeze([]),

  /**
   * If true, all fields and submit button will be disabled
   * @type {boolean}
   */
  _disabled: false,

  /**
   * Change current domain with timeout
   * @type {Function} `(domain: string) => Promise`
   */
  changeDomain: () => {},

  /**
   * Action called on form submit. Action arguments:
   * * formData {Object} data from form
   */
  submit: () => {},

  webCertProxy: computed(function webCertProxy() {
    const promise = this.get('webCertManager').getWebCert();
    return PromiseObject.create({ promise });
  }),

  currentFieldsPrefix: computed('mode', '_subdomainDelegation', function () {
    let {
      mode,
      _subdomainDelegation,
    } = this.getProperties('mode', '_subdomainDelegation');
    switch (mode) {
      case 'show':
        if (_subdomainDelegation) {
          return ['showTop', 'showSubdomain', 'showBottom'];
        } else {
          return ['showTop', 'showDomain', 'showBottom'];
        }
      case 'edit':
        if (_subdomainDelegation) {
          return ['editTop', 'editSubdomain', 'editBottom'];
        } else {
          return ['editTop', 'editDomain', 'editBottom'];
        }
      case 'new':
      default:
        if (_subdomainDelegation) {
          return ['newToken', 'editTop', 'editSubdomain', 'editBottom'];
        } else {
          return ['newToken', 'editTop', 'editDomain', 'editBottom'];
        }
    }
  }),

  /**
   * Preprocessed fields objects
   * @type {computed.EmberObject}
   */
  _fieldsSource: computed(function () {
    let i18n = this.get('i18n');
    let tPrefix = 'components.providerRegistrationForm.fields.';
    let prepareField = (field) => _.assign({}, field, {
      label: i18n.t(tPrefix + field.name + '.label'),
      tip: field.tip ? i18n.t(tPrefix + field.name + '.tip') : undefined,
      example: field.example,
    });
    let fields = EmberObject.create({
      tokenField: prepareField(TOKEN_FIELD),
      topFields: COMMON_FIELDS_TOP.map(prepareField),
      bottomFields: COMMON_FIELDS_BOTTOM.map(prepareField),
      domainField: prepareField(HOSTNAME_FIELD),
      subdomainField: prepareField(SUBDOMAIN_FIELD),
    });
    return fields;
  }),

  /**
   * Domain edition field
   * @type {computed.Ember.Object}
   */
  _tokenField: computed('_fieldsSource.tokenField', 'provider',
    function _tokenField() {
      return this._preprocessField(
        this.get('_fieldsSource.tokenField'),
        'newToken'
      );
    }
  ),

  /**
   * Fields for edition from the top part of the form
   * @type {computed.Array.Ember.Object}
   */
  _editTopFields: computed('_fieldsSource.topFields', 'provider', 'mode',
    function () {
      let {
        _fieldsSource,
        mode,
      } = this.getProperties('_fieldsSource', 'mode');
      let excludedFields = mode === 'edit' ? ['onezoneDomainName'] : ['id'];
      return _fieldsSource.get('topFields')
        .filter((field) => excludedFields.indexOf(field.name) === -1)
        .map((field) =>
          this._preprocessField(field, 'editTop')
        );
    }
  ),

  /**
   * Fields for edition from the bototm part of the form
   * @type {computed.Array.Ember.Object}
   */
  _editBottomFields: computed('_fieldsSource.bottomFields', 'provider',
    function () {
      return this.get('_fieldsSource.bottomFields').map((field) =>
        this._preprocessField(field, 'editBottom')
      );
    }
  ),

  /**
   * Domain edition field
   * @type {computed.Ember.Object}
   */
  _domainEditField: computed('_fieldsSource.domainField', 'provider',
    function () {
      return this._preprocessField(
        this.get('_fieldsSource.domainField'),
        'editDomain'
      );
    }
  ),

  /**
   * Subdomain edition field
   * @type {computed.Ember.Object}
   */
  _subdomainEditField: computed('_fieldsSource.subdomainField', 'provider',
    function () {
      return this._preprocessField(
        this.get('_fieldsSource.subdomainField'),
        'editSubdomain'
      );
    }
  ),

  /**
   * Static fields from the top part of the form
   * @type {computed.Array.Ember.Object}
   */
  _staticTopFields: computed('_fieldsSource.topFields', 'provider', function () {
    let excludedFields = ['onezoneDomainName'];
    return this.get('_fieldsSource.topFields')
      .filter((field) => excludedFields.indexOf(field.name) === -1)
      .map((field) => this._preprocessField(field, 'showTop', true));
  }),

  /**
   * Static fields from the bottom part of the form
   * @type {computed.Array.Ember.Object}
   */
  _staticBottomFields: computed('_fieldsSource.bottomFields', 'provider',
    function () {
      return this.get('_fieldsSource.bottomFields')
        .map((field) => this._preprocessField(field, 'showBottom', true));
    }
  ),

  /**
   * Domain static field
   * @type {computed.Ember.Object}
   */
  _domainStaticField: computed('_fieldsSource.domainField', 'provider',
    function () {
      return this._preprocessField(
        this.get('_fieldsSource.domainField'),
        'showDomain',
        true
      );
    }
  ),

  /**
   * Subdomain static field
   * @type {computed.Ember.Object}
   */
  _subdomainStaticField: computed('_fieldsSource.subdomainField', 'provider',
    function () {
      return this._preprocessField(
        this.get('_fieldsSource.subdomainField'),
        'showSubdomain',
        true
      );
    }
  ),

  allFields: computed(
    '_tokenField',
    '_editTopFields',
    '_editBottomFields',
    '_domainEditField',
    '_subdomainEditField',
    '_staticTopFields',
    '_staticBottomFields',
    '_domainStaticField',
    '_subdomainStaticField',
    function () {
      let properties = [
        '_tokenField',
        '_editTopFields',
        '_editBottomFields',
        '_domainEditField',
        '_subdomainEditField',
        '_staticTopFields',
        '_staticBottomFields',
        '_domainStaticField',
        '_subdomainStaticField',
      ];
      let fields = [];
      properties.forEach((property) => fields = fields.concat(this.get(property)));
      return fields;
    }
  ),

  allFieldsValues: computed('provider', 'allFields', function () {
    let values = EmberObject.create({});
    ALL_PREFIXES.forEach((prefix) => values.set(prefix, EmberObject.create()));
    return values;
  }),

  /**
   * If true, subdomainDelegation toggle is checked
   * @type {computed.boolean}
   */
  _subdomainDelegation: computed(
    'mode',
    'allFieldsValues.{editTop.subdomainDelegation,showTop.subdomainDelegation}',
    function () {
      let {
        mode,
        allFieldsValues,
      } = this.getProperties('mode', 'allFieldsValues');
      return mode === 'show' ?
        allFieldsValues.get('showTop.subdomainDelegation') :
        allFieldsValues.get('editTop.subdomainDelegation');
    }
  ),

  /**
   * Submit button text
   * @type {computed.string}
   */
  submitText: computed('mode', function () {
    let {
      mode,
      i18n,
    } = this.getProperties('mode', 'i18n');
    switch (mode) {
      case 'new':
        return i18n.t('components.providerRegistrationForm.register');
      case 'edit':
        return i18n.t('components.providerRegistrationForm.modifyProviderDetails');
      default:
        break;
    }
  }),

  /**
   * True if the modify request should cause change of Provider domain,
   * so we will reload the application on new domain.
   * @type {Ember.ComputedProperty<boolean>}
   */
  _willChangeDomainAfterSubmit: computed(
    'mode',
    'currentFields.@each.changed',
    function getWillChangeDomainAfterSubmit() {
      if (this.get('mode') === 'edit') {
        const currentFields = this.get('currentFields');
        const domainField = _.find(currentFields, { name: 'editDomain.domain' });
        const subdomainField = _.find(currentFields, { name: 'editSubdomain.subdomain' });
        return domainField && get(domainField, 'changed') ||
          subdomainField && get(subdomainField, 'changed');
      } else {
        return false;
      }
    }
  ),

  _modeObserver: observer('mode', function () {
    this.resetFormValues(ALL_PREFIXES);
  }),

  _subdomainSuffixObserver: observer(
    'mode',
    'allFields',
    'allFieldsValues.editTop.onezoneDomainName',
    function () {
      let {
        mode,
        allFields,
        allFieldsValues,
      } = this.getProperties('mode', 'allFields', 'allFieldsValues');
      if (mode === 'new') {
        let subdomainField = _.find(
          allFields,
          (field) => field.get('name') === 'editSubdomain.subdomain'
        );
        let domain = allFieldsValues.get('editTop.onezoneDomainName');
        subdomainField.set('rightText', domain ? '.' + domain : null);
      }
    }
  ),

  init() {
    this._super(...arguments);
    this.prepareFields();
    this._subdomainSuffixObserver();
    if (this.get('token')) {
      const _fieldsSource = this.get('_fieldsSource');
      set(_fieldsSource, 'tokenField.disabled', true);

      scheduleOnce('afterRender', this, () => {

      });
    }
    next(() => this._modeObserver());
  },

  /**
   * Performs initial field setup.
   * @param {FieldType} field Field
   * @param {string} prefix Field prefix
   * @param {boolean} isStatic Should field be static
   * @returns {object} prepared field
   */
  _preprocessField(field, prefix, isStatic = false) {
    let provider = this.get('provider');
    field = EmberObject.create(field);
    if (provider) {
      const subdomainDelegation = get(provider, 'subdomainDelegation');
      const name = field.get('name');
      const value = get(provider, field.get('name'));
      if (value === undefined) {
        if (field.get('defaultValue') === undefined) {
          field.set('defaultValue', null);
        }
      } else {
        field.set('defaultValue', value);
      }
      if (name === 'subdomain') {
        field.set('rightText', '.' + get(provider, 'onezoneDomainName'));
      }
      if (name === 'domain' && subdomainDelegation) {
        field.set('defaultValue', null);
      }
    } else if (this.get('mode') === 'new') {
      switch (get(field, 'name')) {
        case 'token':
          if (this.get('token')) {
            field.set('defaultValue', this.get('token'));
            field.set('disabled', true);
          }
          break;
        case 'subdomainDelegation':
          {
            const subdomainDelegationSupported =
              this.get('subdomainDelegation');
            if (subdomainDelegationSupported === false) {
              field.set('defaultValue', false);
              field.set('disabled', true);
            }
          }
          break;
        case 'onezoneDomainName':
          {
            const onezoneDomainName = this.get('onezoneDomainName');
            if (onezoneDomainName) {
              field.set('defaultValue', onezoneDomainName);
              field.set('disabled', true);
            }
            break;
          }
        default:
          break;
      }
      // FIXME: subdomainDelegation
      // FIXME: onezoneDomain
    }
    field.set('name', `${prefix}.${field.get('name')}`);
    if (isStatic) {
      field.set('type', 'static');
    }
    return field;
  },

  /**
   * Sets subdomain to converted `fromValue`
   * @param {string} fromValue source value
   */
  _proposeSubdomain(fromValue) {
    let proposedSubdomain = simplifyString(fromValue).substring(0, 63);
    this.set('allFieldsValues.editSubdomain.subdomain', proposedSubdomain);
  },

  actions: {
    inputChanged(fieldName, value) {
      let {
        mode,
        allFields,
      } = this.getProperties('mode', 'allFields');
      this.changeFormValue(fieldName, value);
      if (fieldName === 'editTop.name' && mode === 'new') {
        let subdomainField = _.find(allFields, ((field) => field.get('name') ===
          'editSubdomain.subdomain'));
        if (!subdomainField.get('changed')) {
          this._proposeSubdomain(value);
        }
      }
    },

    focusOut(field) {
      field.set('changed', true);
      this.recalculateErrors();
    },

    submit() {
      const {
        formValues,
        allFields,
        _willChangeDomainAfterSubmit,
      } = this.getProperties('formValues', 'allFields', '_willChangeDomainAfterSubmit');
      let values = EmberObject.create();
      Object.keys(formValues).forEach((prefix) => {
        let prefixValues = formValues.get(prefix);
        Object.keys(prefixValues).forEach(
          (key) => values.set(key, prefixValues.get(key))
        );
      });
      this.set('_disabled', true);
      return this.get('submit')(values)
        .then(() => {
          if (_willChangeDomainAfterSubmit) {
            const domain = this.get('provider.domain');
            this.get('changeDomain')(domain);
          }
        })
        .finally(() => {
          this.set('_disabled', false);
          next(() => {
            if (this.isDestroyed) {
              return;
            }
            this.validateSync();
            // subdomain field may throw errors, so it should be marked as 
            // changed to show that errors
            let subdomainField = _.find(
              allFields,
              ((field) => field.get('name') === 'editSubdomain.subdomain')
            );
            subdomainField.set('changed', true);
            this.recalculateErrors();
          });
        });
    },
  },
});
