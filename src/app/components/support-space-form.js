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

import { isEmpty } from '@ember/utils';

import { inject as service } from '@ember/service';
import { oneWay } from '@ember/object/computed';
import EmberObject, {
  observer,
  computed,
  get,
  getProperties,
} from '@ember/object';
import { Promise } from 'rsvp';
import { invokeAction } from 'ember-invoke-action';
import _ from 'lodash';

import OneFormSimple from 'onedata-gui-common/components/one-form-simple';
import { buildValidations } from 'ember-cp-validations';
import createFieldValidator from 'onedata-gui-common/utils/create-field-validator';
import FORM_FIELDS from 'onepanel-gui/utils/support-space-fields';

import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';

const UNITS = _.find(FORM_FIELDS, { name: 'sizeUnit' }).options;

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

  _importEnabled: oneWay('formValues.main._importEnabled'),

  submitButton: false,

  /**
   * If true, form is visible to user
   * @type {boolean}
   */
  isFormOpened: false,

  /**
   * @type PromiseObject.Array.StorageDetails
   */
  allStoragesProxy: null,

  _selectedStorage: null,
  values: EmberObject.create({
    token: '',
    size: '',
    sizeUnit: 'mib',
    _importEnabled: false,
  }),

  _isImportUpdateFormValid: false,

  isValid: computed('errors', '_isImportUpdateFormValid', function () {
    let {
      errors,
      _importEnabled,
      _isImportUpdateFormValid,
    } = this.getProperties('errors', '_importEnabled',
      '_isImportUpdateFormValid');
    return isEmpty(errors) &&
      (_importEnabled ? _isImportUpdateFormValid : true);
  }),

  // TODO change to ember-cp-validations  
  canSubmit: computed('_selectedStorage', 'isValid', function () {
    let {
      _selectedStorage,
      isValid,
    } = this.getProperties('_selectedStorage', 'isValid');
    return _selectedStorage != null && isValid;
  }),

  /**
   * Resets field if form visibility changes (clears validation errors)
   */
  isFormOpenedObserver: observer('isFormOpened', function () {
    if (this.get('isFormOpened')) {
      this.resetFormValues();
    }
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
    // first storage is default selected storage
    this.get('allStoragesProxy').then((storages) => {
      if (storages.length > 0) {
        this.set('_selectedStorage', storages[0]);
      }
      return storages;
    });
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
      PromiseObject.create({ promise: allStoragesPromise })
    );
  },

  actions: {
    submit() {
      let {
        token,
        size,
        sizeUnit,
        storageImport,
        storageUpdate,
        _importEnabled,
      } = getProperties(
        this.get('formValues.main'),
        'name',
        'token',
        'size',
        'sizeUnit',
        'storageImport',
        'storageUpdate',
        '_importEnabled'
      );

      size = size * _.find(UNITS, { value: sizeUnit })._multiplicator;

      if (!_importEnabled) {
        storageImport = {
          strategy: 'no_import',
        };
        storageUpdate = {
          strategy: 'no_update',
        };
      }

      const storageId = this.get('_selectedStorage.id');

      const submitting = invokeAction(this, 'submitSupportSpace', {
        token,
        size,
        storageId,
        storageImport,
        storageUpdate,
      });

      submitting.catch(error => {
        this.get('globalNotify').backendError('space supporting', error);
      });

      return submitting;
    },
    storageChanged(storage) {
      this.set('_selectedStorage', storage);
    },
    importFormChanged(importFormValues, areValuesValid) {
      this.set('_isImportUpdateFormValid', areValuesValid);
      if (areValuesValid) {
        let formValues = this.get('formValues.main');
        Object.keys(importFormValues).forEach(key => {
          formValues.set(key, get(importFormValues, key));
        });
      }
    },
  },
});
