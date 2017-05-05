/**
 * A form for supporting space
 *
 * Does not provide or invoke backend operations itself - invokes ``submit`` action.
 *
 * @module components/support-space-form
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import { invokeAction } from 'ember-invoke-action';
import OneFormSimple from 'onepanel-gui/components/one-form-simple';
import { buildValidations } from 'ember-cp-validations';
import createFieldValidator from 'onepanel-gui/utils/create-field-validator';

const {
  inject: { service },
  computed,
  ObjectProxy,
  PromiseProxyMixin,
  RSVP: { Promise },
} = Ember;

const ObjectPromiseProxy = ObjectProxy.extend(PromiseProxyMixin);

const FORM_FIELDS = [{
    name: 'token',
    type: 'text',
    tip: 'Globally unique identifier assigned by onezone',
    example: 'MDAxNWxvY...'
  },
  { name: 'size', type: 'number', gt: 0, example: '100' },
  {
    name: 'sizeUnit',
    type: 'radio-group',
    nolabel: true,
    options: [
      { value: 'mb', label: 'MB' },
      { value: 'gb', label: 'GB' },
      { value: 'tb', label: 'TB' },
    ]
  }
];

const MEGA = Math.pow(10, 6);
const GIGA = Math.pow(10, 9);
const TERA = Math.pow(10, 12);

const UNITS = {
  mb: MEGA,
  gb: GIGA,
  tb: TERA,
};

const VALIDATIONS_PROTO = {};

FORM_FIELDS.forEach(field =>
  VALIDATIONS_PROTO[`allFieldsValues.main.${field.name}`] =
  createFieldValidator(field)
);

const Validations = buildValidations(VALIDATIONS_PROTO);

export default OneFormSimple.extend(Validations, {
  classNames: 'support-space-form',

  i18n: service(),
  storageManager: service(),
  globalNotify: service(),

  fields: computed(() => FORM_FIELDS).readOnly(),

  submitButton: false,

  /**
   * @type ObjectPromiseProxy.Array.StorageDetails
   */
  allStoragesProxy: null,

  _selectedStorage: null,
  values: Ember.Object.create({
    token: '',
    size: '',
    sizeUnit: 'mb',
  }),

  // TODO change to ember-cp-validations  
  canSubmit: computed('_selectedStorage', 'isValid', function () {
    let {
      _selectedStorage,
      isValid
    } = this.getProperties('_selectedStorage', 'isValid');
    return _selectedStorage != null && isValid;
  }),

  init() {
    // labels for fields must be declared before OneFormSimple initialization
    let i18n = this.get('i18n');
    FORM_FIELDS.forEach(f => {
      if (!f.label) {
        f.label = i18n.t(`components.supportSpaceForm.fields.${f.name}`);
      }
    });
    this._super(...arguments);
    if (this.get('allStoragesProxy') == null) {
      this._initStoragesProxy();
    }
  },

  _initStoragesProxy() {
    let allStoragesPromise = new Promise((resolve, reject) => {
      let storagesPromise = this.get('storageManager').getStorages()
        .get('promise');
      storagesPromise.then(storages => {
        Promise.all(storages.toArray()).then(resolve, reject);
      });
      storagesPromise.catch(reject);
    });

    this.set(
      'allStoragesProxy',
      ObjectPromiseProxy.create({ promise: allStoragesPromise })
    );
  },

  actions: {
    submit() {
      let {
        token,
        size,
        sizeUnit,
      } = this.get('formValues').getProperties('name', 'token', 'size', 'sizeUnit');

      size = size * UNITS[sizeUnit];

      let storageId = this.get('_selectedStorage.name');

      let submitting = invokeAction(this, 'submitSupportSpace', {
        token,
        size,
        storageId,
      });

      submitting.catch(error => {
        this.get('globalNotify').backendError('space supporting', error);
      });

      return submitting;
    },
    storageChanged(storage) {
      this.set('_selectedStorage', storage);
    },
  },
});
