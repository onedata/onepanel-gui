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

import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import {
  observer,
  get,
  set,
  getProperties,
} from '@ember/object';
import { Promise } from 'rsvp';
import _ from 'lodash';

import OneFormSimple from 'onedata-gui-common/components/one-form-simple';
import { buildValidations } from 'ember-cp-validations';
import createFieldValidator from 'onedata-gui-common/utils/create-field-validator';
import FORM_FIELDS from 'onepanel-gui/utils/support-space-fields';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { and, or, not, isEmpty } from 'ember-awesome-macros';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';

const UNITS = _.find(FORM_FIELDS, { name: 'sizeUnit' }).options;

const valdiationsProto = {};
FORM_FIELDS.forEach(field =>
  valdiationsProto[`allFieldsValues.main.${field.name}`] =
  createFieldValidator(field)
);

export default OneFormSimple.extend(I18n, buildValidations(valdiationsProto), {
  classNames: ['support-space-form'],

  i18n: service(),
  storageManager: service(),
  spaceManager: service(),
  globalNotify: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.supportSpaceForm',

  /**
   * @override
   */
  submitButton: false,

  /**
   * @override
   */
  fields: Object.freeze(FORM_FIELDS),

  /**
   * @virtual
   * @type {Function}
   */
  submitSupportSpace: notImplementedReject,

  /**
   * If true, form is visible to user
   * @type {boolean}
   * @virtual
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

  /**
   * @type {Object} The same as in array allStoragesItemsProxy
   */
  selectedStorageItem: null,

  /**
   * @type {boolean}
   */
  isImportUpdateFormValid: false,

  /**
   * @override
   */
  values: Object.freeze({
    token: '',
    size: '',
    sizeUnit: 'mib',
    importEnabled: false,
  }),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  importEnabled: reads('formValues.main.importEnabled'),

  /**
   * @override
   */
  isValid: and(
    isEmpty('errors'),
    or(not('importEnabled'), 'isImportUpdateFormValid')
  ),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  canSubmit: and('selectedStorageItem', 'isValid'),

  selectedStorageObserver: observer(
    'selectedStorageItem',
    function selectedStorageObserver() {
      this.recalculateImportAvailability();
    }
  ),

  importEnabledTipSetter: observer('importEnabled', function importEnabledTipSetter() {
    const importEnabled = this.get('importEnabled');
    const importEnabledField = this.getField('main.importEnabled');
    const tipTranslationKey =
      `fields.importEnabled.tip${importEnabled ? 'Enabled' : 'Disabled' }`;
    const tip = this.t(tipTranslationKey);
    set(importEnabledField, 'tip', tip);
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
    FORM_FIELDS.forEach(f => {
      if (!f.label) {
        f.label = this.t(`fields.${f.name}.name`);
      }
      if (f.tip) {
        f.tip = this.t(`fields.${f.name}.tip`);
      }
    });
    this._super(...arguments);

    if (this.get('allStoragesItemsProxy') == null) {
      this.initStoragesProxy();
    }

    this.importEnabledTipSetter();

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

        return storages
          .map(storage => {
            const {
              id,
              importedStorage,
            } = getProperties(storage, 'id', 'importedStorage');
            const disabled = importedStorage &&
              supportingStoragesIds.includes(id);

            return {
              storage,
              disabled,
            };
          })
          .sortBy('name', 'disabled');
      });

    this.set(
      'allStoragesItemsProxy',
      PromiseObject.create({ promise: storagesProxyPromise })
    );
  },

  recalculateImportAvailability() {
    this.send(
      'inputChanged',
      'main.importEnabled',
      this.get('selectedStorageItem.storage.importedStorage') || false,
    );
  },

  actions: {
    submit() {
      const {
        submitSupportSpace,
        globalNotify,
      } = this.getProperties(
        'submitSupportSpace',
        'globalNotify'
      );

      let {
        token,
        size,
        sizeUnit,
        storageImport,
        storageUpdate,
        importEnabled,
      } = getProperties(
        this.get('formValues.main'),
        'name',
        'token',
        'size',
        'sizeUnit',
        'storageImport',
        'storageUpdate',
        'importEnabled'
      );

      size = size * _.find(UNITS, { value: sizeUnit })._multiplicator;

      if (!importEnabled) {
        storageImport = {
          strategy: 'no_import',
        };
        storageUpdate = {
          strategy: 'no_update',
        };
      }

      const storageId = this.get('selectedStorageItem.storage.id');

      return submitSupportSpace({
        token,
        size,
        storageId,
        storageImport,
        storageUpdate,
      }).catch(error => {
        globalNotify.backendError('space supporting', error);
        throw error;
      });
    },
    storageChanged(storageItem) {
      this.set('selectedStorageItem', storageItem);
    },
    importFormChanged(importFormValues, areValuesValid) {
      this.set('isImportUpdateFormValid', areValuesValid);
      if (areValuesValid) {
        const formValues = this.get('formValues.main');
        Object.keys(importFormValues).forEach(key => {
          formValues.set(key, get(importFormValues, key));
        });
      }
    },
  },
});
