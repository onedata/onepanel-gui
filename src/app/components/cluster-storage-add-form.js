/**
 * A form for adding new and modifying existing storage with all storage types
 * available.
 *
 * @author Jakub Liput, Michał Borzęcki, Agnieszka Warchoł
 * @copyright (C) 2017-2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/i18n';
import EmberObject, {
  computed,
  set,
  observer,
} from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import { BasicGroup } from '../utils/cluster-storage/basic-group';
import { CephRadosGroup } from '../utils/cluster-storage/ceph-rados-group';
import { PosixGroup } from '../utils/cluster-storage/posix-group';
import { NfsGroup } from '../utils/cluster-storage/nfs-group';
import { S3Group } from '../utils/cluster-storage/s3-group';
import { SwiftGroup } from '../utils/cluster-storage/swift-group';
import { GlusterfsGroup } from '../utils/cluster-storage/glusterfs-group';
import { XrootdGroup } from '../utils/cluster-storage/xrootd-group';
import { WebdavGroup } from '../utils/cluster-storage/webdav-group';
import { HttpGroup } from '../utils/cluster-storage/http-group';
import { NullDeviceGroup } from '../utils/cluster-storage/null-device-group';
import { LumaGroup } from '../utils/cluster-storage/luma-group';
import config from 'ember-get-config';
import { equal } from '@ember/object/computed';
import notImplementedThrow from 'onedata-gui-common/utils/not-implemented-throw';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import stripObject from 'onedata-gui-common/utils/strip-object';
import _ from 'lodash';

const {
  layoutConfig,
} = config;

const storagePathTypeConfig = {
  posix: { defaultValue: 'canonical', disabled: true },
  glusterfs: { defaultValue: 'canonical', disabled: true },
  nulldevice: { defaultValue: 'canonical' },
  ceph: { defaultValue: 'flat' },
  cephrados: { defaultValue: 'flat', disabled: true },
  s3: {},
  swift: { defaultValue: 'flat' },
  xrootd: { defaultValue: 'canonical', disabled: true },
  http: { defaultValue: 'canonical', disabled: true },
  webdav: { defaultValue: 'canonical', disabled: true },
  nfs: { defaultValue: 'canonical', disabled: true },
};

export default Component.extend(I18n, {
  classNames: ['cluster-storage-add-form'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.clusterStorageAddForm',

  /**
   * @virtual
   * @type {(formData: Object) => Promise<void>}
   */
  onSubmit: undefined,

  /**
   * Storage to show/edit
   * @virtual optional
   * @type {Onepanel.StorageDetails}
   */
  storage: null,

  /**
   * Form mode. Available values: create, edit, show
   * @virtual optional
   * @type {string}
   */
  mode: 'create',

  /**
   * If true, then edited storage already supports some spaces.
   * @virtual optional
   * @type {boolean}
   */
  storageProvidesSupport: false,

  /**
   * If true, form is visible to user
   * @virtual optional
   * @type {boolean}
   */
  isFormOpened: false,

  /**
   * Called when user clicks "Cancel" button in edit mode
   * @virtual optional
   * @type {function}
   * @returns {any}
   */
  cancel: notImplementedThrow,

  /**
   * Form layout config
   * @type {Object}
   */
  layoutConfig,

  /**
   * @type {boolean}
   */
  areQosParamsValid: true,

  /**
   * @type {Object}
   */
  editedQosParams: undefined,

  /**
   * @type {boolean}
   */
  isSavingStorage: false,

  /**
   * @type {boolean}
   */
  isSubmitting: false,

  /**
   * @type {Object}
   */
  selectedStorageType: reads('fields.value.basic.type'),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  inEditionMode: equal('mode', 'edit'),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  inShowMode: equal('mode', 'show'),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  storageHasQosParameters: computed(
    'storage.qosParameters',
    function storageHasQosParameters() {
      const qosParams = this.storage?.qosParameters;
      return !qosParams || Boolean(Object.keys(qosParams).length);
    }
  ),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsRootGroup>}
   */
  fields: computed(function fields() {
    const component = this;

    const formContext = EmberObject.extend({
      editorMode: reads('component.mode'),
      loadedStorage: reads('component.storage'),
    }).create({ component });

    return FormFieldsRootGroup
      .extend({
        i18nPrefix: computed('component.i18nPrefix', function i18nPrefix() {
          return `${this.component.i18nPrefix}.fields`;
        }),
        ownerSource: reads('component'),
        isEnabled: computed('component.isSubmitting', function isEnabled() {
          return !this.component.isSubmitting;
        }),
      })
      .create({
        component,
        fields: [
          BasicGroup,
          LumaGroup,
          CephRadosGroup,
          PosixGroup,
          NfsGroup,
          S3Group,
          SwiftGroup,
          GlusterfsGroup,
          WebdavGroup,
          HttpGroup,
          XrootdGroup,
          NullDeviceGroup,
        ].map((FieldClass) => FieldClass.create({ context: formContext })),
      });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsGroup>}
   */
  basicGroup: computed('fields', function basicGroup() {
    return this.fields.getFieldByPath('basic');
  }),

  nullDeviceGroup: computed('fields', function nullDeviceGroup() {
    return this.fields.getFieldByPath('nulldevice');
  }),

  s3Group: computed('fields', function s3Group() {
    return this.fields.getFieldByPath('s3');
  }),

  webdavGroup: computed('fields', function webdavGroup() {
    return this.fields.getFieldByPath('webdav');
  }),

  isValid: computed(
    'fields.isValid',
    'areQosParamsValid',
    function isValid() {
      if (!this.areQosParamsValid) {
        return false;
      } else {
        return this.fields.isValid;
      }
    }
  ),

  /**
   * Resets field if form visibility changes (clears validation errors)
   */
  isFormOpenedObserver: observer('isFormOpened', function isFormOpenedObserver() {
    if (this.isFormOpened) {
      this.fields.reset();
      this.setProperties({
        areQosParamsValid: true,
        editedQosParams: undefined,
      });
    }
  }),

  storageProvidesSupportObserver: observer(
    'storageProvidesSupport',
    function storageProvidesSupportObserver() {
      const type = this.basicGroup.getFieldByPath('type').value;
      this.autoSettingsImportedStorage(type);
    }
  ),

  modeObserver: observer('mode', function modeObserver() {
    if (this.storage) {
      this._fillInForm();
    }
    const type = this.selectedStorageType;
    this.autoSettingsAll(type);
    this.setProperties({
      areQosParamsValid: true,
      editedQosParams: undefined,
    });
  }),

  init() {
    this._super(...arguments);

    if (this.storage) {
      this._fillInForm();
    }
    if (this.mode !== 'show' && this.selectedStorageType) {
      this.storageTypeChanged(this.selectedStorageType);
    }
  },

  _fillInForm() {
    const { storage, fields } = this;
    const storageType = storage?.type;
    const indexOfBasicGroup = fields.fields.findIndex(
      (field) => field.name === 'basic'
    );

    if (indexOfBasicGroup !== -1) {
      for (const field of fields.fields[indexOfBasicGroup].fields) {
        const name = field.name;
        if (name in storage && storage[name] !== undefined && storage[name] !== '') {
          fields.valuesSource.basic.set(name, storage[name]);
        }
      }
      if (storage.lumaFeed === 'external') {
        const lumaGroup = fields.getFieldByPath('luma');
        if (lumaGroup) {
          for (const field of lumaGroup.fields) {
            const name = field.name;
            if (name in storage && storage[name] !== undefined && storage[name] !== '') {
              fields.valuesSource.luma.set(name, storage[name]);
            }
          }
        }
      }
    }

    const indexOfStorageTypeGroup = fields.fields.findIndex(
      (field) => field.name === storageType
    );

    if (indexOfStorageTypeGroup !== -1) {
      for (const field of fields.fields[indexOfStorageTypeGroup].fields) {
        const name = field.name;
        if (name in storage && storage[name] !== undefined && storage[name] !== '') {
          fields.valuesSource[storageType].set(name, storage[name]);
        }
      }
    }
  },

  storageTypeChanged(type) {
    this.setProperties({
      areQosParamsValid: true,
      editedQosParams: undefined,
    });

    this.changePathType(type);
    this.autoSettingsAll(type);
  },

  storagePathTypeChanged() {
    const type = this.basicGroup.getFieldByPath('type').value;

    this.autoSettingsImportedStorage(type);
    this.autoSettingsReadonly(type);
    this.autoSettingsBlockSize(type);
    this.autoSettingsMaxCanonicalObjectSize(type);
  },

  importedStorageChanged() {
    const type = this.basicGroup.getFieldByPath('type').value;

    this.autoSettingsReadonly(type);
    this.autoSettingsSimulatedFilesystem(type);
    this.autoSettingsImportedItemMode(type);
  },

  readonlyChanged() {
    const type = this.basicGroup.getFieldByPath('type').value;

    this.autoSettingsRangeWriteSupport(type);
  },

  changePathType(type) {
    if (this.mode === 'show') {
      return;
    }

    const config = storagePathTypeConfig[type];
    if (config.defaultValue) {
      this.basicGroup.getFieldByPath('storagePathType').valueChanged(config.defaultValue);
    }
    this.basicGroup.getFieldByPath('storagePathType').setProperties({
      isEnabled: !config.disabled ?? true,
    });
  },

  autoSettingsImportedStorage(type) {
    if (this.mode === 'show') {
      return;
    }

    const pathType = this.basicGroup.getFieldByPath('storagePathType').value;
    let disabled = this.storageProvidesSupport;
    let value = this.storage?.importedStorage;
    let lockHint = null;

    if (type === 'http') {
      disabled = true;
      value = true;
      lockHint = this.t('httpOnlyImported');
    } else if (type === 's3') {
      disabled = true;
      value = pathType === 'canonical';
    }

    if (disabled) {
      this.basicGroup.getFieldByPath('importedStorage').valueChanged(value);
    }
    this.basicGroup.getFieldByPath('importedStorage').setProperties({
      isEnabled: !disabled,
    });
    if (lockHint) {
      this.basicGroup.getFieldByPath('importedStorage').setProperties({
        disabledControlTip: lockHint,
      });
    }
  },

  autoSettingsReadonly(type) {
    if (this.mode === 'show') {
      return;
    }
    const isImportedStorage = this.basicGroup.getFieldByPath('importedStorage').value;
    const pathType = this.basicGroup.getFieldByPath('storagePathType').value;

    let locked;
    let value = null;
    let hint = null;

    if (isImportedStorage) {
      locked = false;
    } else {
      locked = true;
      value = false;
      hint = this.t('cannotReadonlyNotImported');
    }

    // HTTP storage type implies that storage is imported,
    // so it will be eventually locked to true
    if (type === 'http') {
      locked = true;
      value = true;
      hint = this.t('httpOnlyReadonly');
    }

    if (type === 's3' &&
      pathType === 'canonical' &&
      isImportedStorage
    ) {
      locked = true;
      value = true;
    }
    if (value !== null) {
      this.basicGroup.getFieldByPath('readonly').valueChanged(value);
    }
    this.basicGroup.getFieldByPath('readonly').setProperties({
      isEnabled: !locked,
    });
    if (hint) {
      this.basicGroup.getFieldByPath('readonly').setProperties({
        disabledControlTip: hint,
      });
    }
  },

  autoSettingsRangeWriteSupport(type) {
    if (this.mode === 'show' || type !== 'webdav') {
      return;
    }

    const isReadonly = this.basicGroup.getFieldByPath('readonly').value;
    const currentValue = this.webdavGroup.getFieldByPath('rangeWriteSupport').value;

    if (isReadonly) {
      this.webdavGroup.getFieldByPath('rangeWriteSupport').setProperties({
        isEnabled: false,
      });
      if (currentValue !== 'none') {
        this.webdavGroup.getFieldByPath('rangeWriteSupport').valueChanged('none');
      }
    } else {
      this.webdavGroup.getFieldByPath('rangeWriteSupport').setProperties({
        isEnabled: true,
        defaultValue: null,
      });
      this.webdavGroup.getFieldByPath('rangeWriteSupport').options[0].isEnabled = false;
      if (currentValue === 'none') {
        this.webdavGroup.getFieldByPath('rangeWriteSupport').valueChanged(null);
      }
    }
  },

  autoSettingsBlockSize(type) {
    if (type !== 's3' || this.mode === 'show') {
      return;
    }

    const pathType = this.basicGroup.getFieldByPath('storagePathType').value;
    const blockSize = this.s3Group.getFieldByPath('blockSize').value;

    if (pathType === 'canonical' || blockSize === 0) {
      this.s3Group.getFieldByPath('blockSize').valueChanged(
        pathType === 'canonical' ? 0 : null
      );
    }
    this.s3Group.getFieldByPath('blockSize').set('isEnabled', pathType !== 'canonical');
  },

  autoSettingsSimulatedFilesystem(type) {
    if (type !== 'nulldevice' || this.mode === 'show') {
      return;
    }
    const importedStorage = this.basicGroup.getFieldByPath('importedStorage').value;
    const growSpeedField = this.nullDeviceGroup.getFieldByPath('simulatedFilesystemGrowSpeed');
    const paramsField = this.nullDeviceGroup.getFieldByPath('simulatedFilesystemParameters');

    growSpeedField.set('isEnabled', importedStorage);
    paramsField.set('isEnabled', importedStorage);

    if (!importedStorage) {
      growSpeedField.valueChanged(null);
      paramsField.valueChanged(null);
    }
  },

  autoSettingsMaxCanonicalObjectSize(type) {
    if (type !== 's3' || this.mode === 'show') {
      return;
    }

    const pathType = this.basicGroup.getFieldByPath('storagePathType').value;
    const maxCanonicalObjectSize = this.s3Group.getFieldByPath('maximumCanonicalObjectSize');
    const isFieldDisabled = pathType === 'flat';
    maxCanonicalObjectSize.set('isEnabled', !isFieldDisabled);
    if (isFieldDisabled) {
      maxCanonicalObjectSize.valueChanged(null);
    }
  },

  autoSettingsImportedItemMode(type) {
    if (type !== 's3' || this.mode === 'show') {
      return;
    }

    const importedStorage = this.basicGroup.getFieldByPath('importedStorage').value;
    const fileModeField = this.s3Group.getFieldByPath('fileMode');
    const dirModeField = this.s3Group.getFieldByPath('dirMode');
    fileModeField.set('isEnabled', importedStorage);
    dirModeField.set('isEnabled', importedStorage);
    if (!importedStorage) {
      fileModeField.valueChanged(null);
      dirModeField.valueChanged(null);
    }
  },

  autoSettingsAll(type) {
    this.autoSettingsImportedStorage(type);
    this.autoSettingsReadonly(type);
    this.autoSettingsRangeWriteSupport(type);
    this.autoSettingsBlockSize(type);
    this.autoSettingsMaxCanonicalObjectSize(type);
    this.autoSettingsSimulatedFilesystem(type);
    this.autoSettingsImportedItemMode(type);
  },

  willDestroyElement() {
    this._super(...arguments);
    this.get('fields').destroy();
  },

  actions: {
    qosParamsChanged({ isValid, qosParams }) {
      this.setProperties({
        areQosParamsValid: isValid,
        editedQosParams: qosParams,
      });
    },

    async submit() {
      const {
        selectedStorageType,
        inEditionMode,
        storage,
        fields,
        editedQosParams,
      } = this;

      this.set('isSavingStorage', true);
      const form = fields.dumpValue();
      let formData = {};
      for (const [name, value] of Object.entries(form.basic)) {
        formData[name] = value;
      }

      if (form.basic.lumaFeed === 'external') {
        for (const [name, value] of Object.entries(form.luma)) {
          formData[name] = value;
        }
      }

      for (const [name, value] of Object.entries(form[selectedStorageType])) {
        formData[name] = value;
      }

      formData = stripObject(formData, [undefined, null]);
      if (editedQosParams) {
        set(formData, 'qosParameters', editedQosParams);
      }

      if (!inEditionMode) {
        formData = stripObject(formData, ['']);
      } else {
        _.keys(formData).forEach(key => {
          // change cleared fields to null
          if (formData[key] === '') {
            formData[key] = null;
          }
          // remove not modified data
          const storageValue = storage[key] === undefined || storage[key] === '' ?
            null : storage[key];
          if ((storageValue === null && formData[key] === null) ||
            (JSON.stringify(storageValue) === JSON.stringify(formData[key]) &&
              storageValue !== null && formData[key] !== null)) {
            delete formData[key];
          }
        });
      }

      try {
        await this.onSubmit?.(formData);
      } finally {
        safeExec(this, () => this.set('isSavingStorage', false));
      }
    },

    cancel() {
      this.cancel();
      this.fields.reset();
      this._fillInForm();
    },
  },
});
