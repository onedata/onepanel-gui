/**
 * A form for supporting space
 *
 * Does not provide or invoke backend operations itself - invokes ``submit`` action.
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import { observer, getProperties } from '@ember/object';
import { Promise } from 'rsvp';
import _ from 'lodash';

import OneFormSimple from 'onedata-gui-common/components/one-form-simple';
import { buildValidations } from 'ember-cp-validations';
import createFieldValidator from 'onedata-gui-common/utils/create-field-validator';
import formFields from 'onepanel-gui/utils/support-space-fields';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { and, or, not, isEmpty } from 'ember-awesome-macros';
import trimToken from 'onedata-gui-common/utils/trim-token';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';

const units = _.find(formFields, { name: 'sizeUnit' }).options;

const valdiationsProto = {};
formFields.forEach(field =>
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
   * Initialized in init method
   */
  fields: undefined,

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
   *   isImportedAndUsed: boolean,
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
  isImportFormValid: false,

  /**
   * @override
   */
  values: Object.freeze({
    token: '',
    size: '',
    sizeUnit: 'mib',
  }),

  /**
   * @type {SpaceSupportAccountingFormValues}
   */
  accountingConfig: undefined,

  /**
   * @type {boolean}
   */
  importEnabled: reads('selectedStorageItem.storage.importedStorage'),

  /**
   * @override
   */
  isValid: and(
    isEmpty('errors'),
    or(not('importEnabled'), 'isImportFormValid')
  ),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  canSubmit: and('selectedStorageItem', 'isValid'),

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
    formFields.forEach(f => {
      if (!f.label) {
        f.label = this.t(`fields.${f.name}.name`);
      }
      if (f.tip) {
        f.tip = this.t(`fields.${f.name}.tip`);
      }
    });
    this.set('fields', _.cloneDeep(formFields));
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

        return storages
          .map(storage => {
            const {
              id,
              importedStorage,
            } = getProperties(storage, 'id', 'importedStorage');
            const isImportedAndUsed = importedStorage &&
              supportingStoragesIds.includes(id);

            return {
              storage,
              isImportedAndUsed,
              disabled: isImportedAndUsed,
            };
          })
          .sortBy('name', 'disabled');
      });

    this.set(
      'allStoragesItemsProxy',
      PromiseObject.create({ promise: storagesProxyPromise })
    );
  },

  actions: {
    submit() {
      const {
        importEnabled,
        submitSupportSpace,
        globalNotify,
        accountingConfig,
      } = this.getProperties(
        'importEnabled',
        'submitSupportSpace',
        'globalNotify',
        'accountingConfig'
      );

      let {
        token,
        size,
        sizeUnit,
        storageImport,
      } = getProperties(
        this.get('formValues.main'),
        'name',
        'token',
        'size',
        'sizeUnit',
        'storageImport',
      );

      size = size * _.find(units, { value: sizeUnit })._multiplicator;
      const storageId = this.get('selectedStorageItem.storage.id');

      const supportRequestBody = Object.assign({
        token: trimToken(token),
        size,
        storageId,
      }, accountingConfig);
      if (importEnabled) {
        supportRequestBody.storageImport = storageImport;
      }

      return submitSupportSpace(supportRequestBody).catch(error => {
        globalNotify.backendError('space supporting', error);
        throw error;
      });
    },
    storageChanged(storageItem) {
      this.set('selectedStorageItem', storageItem);
    },
    importFormChanged(importFormValues, areValuesValid) {
      this.set('isImportFormValid', areValuesValid);
      if (areValuesValid) {
        this.set('formValues.main.storageImport', importFormValues);
      }
    },
    accountingConfigChanged(accountingConfig) {
      this.set('accountingConfig', accountingConfig);
    },
  },
});
