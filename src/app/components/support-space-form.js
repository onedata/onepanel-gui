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
import I18n from 'onedata-gui-common/mixins/components/i18n';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';

const UNITS = _.find(FORM_FIELDS, { name: 'sizeUnit' }).options;

const VALIDATIONS_PROTO = {};

FORM_FIELDS.forEach(field =>
  VALIDATIONS_PROTO[`allFieldsValues.main.${field.name}`] =
  createFieldValidator(field)
);

const Validations = buildValidations(VALIDATIONS_PROTO);

export default OneFormSimple.extend(I18n, Validations, {
  classNames: 'support-space-form',

  i18n: service(),
  storageManager: service(),
  spaceManager: service(),
  globalNotify: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.supportSpaceForm',

  fields: computed(() => FORM_FIELDS).readOnly(),

  _importEnabled: oneWay('formValues.main._importEnabled'),

  submitButton: false,

  /**
   * If true, form is visible to user
   * @type {boolean}
   */
  isFormOpened: false,

  /**
   * PromiseObject with array of objects:
   * ```
   * {
   *   disabled: boolean, // true if cannot be used for support
   *   storage: StorageDetails,
   * }
   * ```
   * @type {PromiseObject<Array<Object>>}
   */
  allStoragesItemsProxy: null,

  selectedStorageItem: null,
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
  canSubmit: computed('selectedStorageItem', 'isValid', function () {
    const {
      selectedStorageItem,
      isValid,
    } = this.getProperties('selectedStorageItem', 'isValid');
    return selectedStorageItem && isValid;
  }),

  selectedStorageObserver: observer(
    'selectedStorageItem',
    function selectedStorageObserver() {
      this.recalculateImportAvailability();
    }
  ),

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
    FORM_FIELDS.forEach(f => {
      if (!f.label) {
        f.label = this.t(`fields.${f.name}`);
      }
    });
    this._super(...arguments);
    if (this.get('allStoragesItemsProxy') == null) {
      this.initStoragesProxy();
    }
    // first enabled storage is default selected storage
    this.get('allStoragesItemsProxy').then((storages) => {
      const enabledStoragesItems = storages.rejectBy('disabled');
      if (enabledStoragesItems.length > 0) {
        safeExec(this, 'set', 'selectedStorageItem', enabledStoragesItems[0]);
      }
    });
  },

  initStoragesProxy() {
    const {
      storageManager,
      spaceManager,
    } = this.getProperties('storageManager', 'spaceManager');

    const storagesPromise = storageManager.getStorages()
      .then(list => Promise.all(list.toArray()));
    const spacesPromise = spaceManager.getSpaces()
      .then(list => Promise.all(list.toArray()));

    const storagesProxyPromise = Promise.all([storagesPromise, spacesPromise])
      .then(([storages, spaces]) => {
        const supportingStoragesIds = spaces.mapBy('storageId').compact();

        return storages.map(storage => {
          const {
            id,
            importExistingData,
          } = getProperties(storage, 'id', 'importExistingData');
          const disabled = importExistingData &&
            supportingStoragesIds.includes(id);

          return {
            storage,
            disabled,
          };
        });
      });

    this.set(
      'allStoragesItemsProxy',
      PromiseObject.create({ promise: storagesProxyPromise })
    );
  },

  recalculateImportAvailability() {
    this.send(
      'inputChanged',
      'main._importEnabled',
      this.get('selectedStorageItem.storage.importExistingData'),
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

      const storageId = this.get('selectedStorageItem.storage.id');

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
    storageChanged(storageItem) {
      this.set('selectedStorageItem', storageItem);
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
