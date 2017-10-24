/**
 * A view to create, show or edit registered provider details
 *
 * @module components/provider-registration-form
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OneForm from 'onedata-gui-common/components/one-form';
import simplifyString from 'onedata-gui-common/utils/simplify-string';
import { validator, buildValidations } from 'ember-cp-validations';
import createFieldValidator from 'onedata-gui-common/utils/create-field-validator';
import Ember from 'ember';
import _ from 'lodash';

const {
  computed,
  observer,
  on,
  get,
  inject: {
    service,
  },
} = Ember;

const COMMON_FIELDS_TOP = [{
    name: 'id',
    type: 'static',
  },
  {
    name: 'name',
    type: 'text',
  },
  {
    name: 'onezoneDomainName',
    type: 'text',
  },
  {
    name: 'subdomainDelegation',
    type: 'checkbox',
    defaultValue: true,
    tip: true,
  },
];

const HOSTNAME_FIELD = {
  name: 'domain',
  type: 'text',
  // regex taken from
  // https://stackoverflow.com/questions/7930751/regexp-for-subdomain
  regex: /^(?!.{256})(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:[a-z]{1,63}|xn--[a-z0-9]{1,59})$/,
  tip: true,
};

const SUBDOMAIN_FIELD = {
  name: 'subdomain',
  type: 'text',
  // regex taken from
  // https://stackoverflow.com/questions/7930751/regexp-for-subdomain
  regex: /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/,
  tip: true,
};

const COMMON_FIELDS_BOTTOM = [{
    name: 'geoLatitude',
    type: 'number',
    step: 0.000001,
    lte: 90,
    gte: -90,
    optional: true,
  },
  {
    name: 'geoLongitude',
    type: 'number',
    label: 'Longitude',
    step: 0.000001,
    lte: 180,
    gte: -180,
    optional: true,
  },
];

const VALIDATIONS_PROTO = {};
const FIELDS_PREFIXES = [
  { fields: COMMON_FIELDS_TOP, prefix: 'editTop' },
  { fields: [HOSTNAME_FIELD], prefix: 'editDomain' },
  { fields: [SUBDOMAIN_FIELD], prefix: 'editSubdomain' },
  { fields: COMMON_FIELDS_BOTTOM, prefix: 'editBottom' },
];

FIELDS_PREFIXES.forEach(({ fields, prefix }) => {
  fields.forEach((field) => {
    const validators = createFieldValidator(field);
    if (field.name === 'subdomain') {
      validators.push(validator('exclusion', {
        in: computed.readOnly('model.excludedSubdomains'),
        message: computed(function () {
          return this.get('model.i18n')
            .t('components.providerRegistrationForm.subdomainReserved');
        }),
      }));
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
];

const Validations = buildValidations(VALIDATIONS_PROTO);
const ALL_PREFIXES = [
  'editTop',
  'editBottom',
  'editDomain',
  'editSubdomain',
  'showTop',
  'showBottom',
  'showDomain',
  'showSubdomain',
];

export default OneForm.extend(Validations, {
  classNames: ['provider-registration-form'],

  i18n: service(),

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
  excludedSubdomains: [],

  /**
   * If true, all fields and submit button will be disabled
   * @type {boolean}
   */
  _disabled: false,

  /**
   * Action called on form submit. Action arguments:
   * * formData {Object} data from form
   */
  submit: () => {},

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
      default:
        if (_subdomainDelegation) {
          return ['editTop', 'editSubdomain', 'editBottom'];
        } else {
          return ['editTop', 'editDomain', 'editBottom'];
        }
    }
  }),

  /**
   * Preprocessed fields objects
   * @type {computed.Array.FieldType}
   */
  _fieldsSource: computed(function () {
    let i18n = this.get('i18n');
    let tPrefix = 'components.providerRegistrationForm.fields.';
    let prepareField = (field) => _.assign({}, field, {
      label: i18n.t(tPrefix + field.name + '.label'),
      tip: field.tip ? i18n.t(tPrefix + field.name + '.tip') : undefined,
    });
    let fields = Ember.Object.create({
      topFields: COMMON_FIELDS_TOP.map(prepareField),
      bottomFields: COMMON_FIELDS_BOTTOM.map(prepareField),
      domainField: prepareField(HOSTNAME_FIELD),
      subdomainField: prepareField(SUBDOMAIN_FIELD),
    });
    return fields;
  }),

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
    let values = Ember.Object.create({});
    ALL_PREFIXES.forEach((prefix) => values.set(prefix, Ember.Object.create()));
    return values;
  }),

  /**
   * If true, subdomainDelegation toggle is checked
   * @type {computed.boolean}
   */
  _subdomainDelegation: computed(
    'mode',
    'allFieldsValues.editTop.subdomainDelegation',
    'allFieldsValues.showTop.subdomainDelegation',
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

  _modeObserver: on('init', observer('mode', function () {
    this.resetFormValues(ALL_PREFIXES);
  })),

  // TODO add domain loading when mode===edit 
  // (provider does not have information about onezone domain)
  _subdomainSuffixObserver: on('init', observer(
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
  )),

  init() {
    this._super(...arguments);
    this.prepareFields();
  },

  /**
   * Performs initial field setup.
   * @param {FieldType} field Field
   * @param {string} prefix Field prefix
   * @param {boolean} isStatic Should field be static
   */
  _preprocessField(field, prefix, isStatic = false) {
    let provider = this.get('provider');
    field = Ember.Object.create(field);
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
      let {
        formValues,
        allFields,
      } = this.getProperties('formValues', 'allFields');
      let values = Ember.Object.create();
      Object.keys(formValues).forEach((prefix) => {
        let prefixValues = formValues.get(prefix);
        Object.keys(prefixValues).forEach(
          (key) => values.set(key, prefixValues.get(key))
        );
      });
      this.set('_disabled', true);
      let submitting = this.get('submit')(values);
      submitting.finally(() => {
        this.set('_disabled', false);
        Ember.run.next(() => {
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
      return submitting;
    },
  },
});
