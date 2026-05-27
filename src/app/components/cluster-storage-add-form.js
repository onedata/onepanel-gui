/**
 * A form for adding new and modifying existing storage with all storage types
 * available.
 *
 * @author Jakub Liput, Michał Borzęcki, Agnieszka Warchoł
 * @copyright (C) 2017-2025 ACK CYFRONET AGH
 * @copyright (C) 2026 Onedata (onedata.org)
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/i18n';
import EmberObject, {
  computed,
  set,
  observer,
} from '@ember/object';
import { reads, equal } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import { BasicGroup } from 'onepanel-gui/utils/cluster-storage/basic-group';
import { CephRadosGroup } from 'onepanel-gui/utils/cluster-storage/ceph-rados-group';
import { PosixGroup } from 'onepanel-gui/utils/cluster-storage/posix-group';
import { NfsGroup } from 'onepanel-gui/utils/cluster-storage/nfs-group';
import { S3Group } from 'onepanel-gui/utils/cluster-storage/s3-group';
import { SwiftGroup } from 'onepanel-gui/utils/cluster-storage/swift-group';
import { GlusterfsGroup } from 'onepanel-gui/utils/cluster-storage/glusterfs-group';
import { XrootdGroup } from 'onepanel-gui/utils/cluster-storage/xrootd-group';
import { WebdavGroup } from 'onepanel-gui/utils/cluster-storage/webdav-group';
import { HttpGroup } from 'onepanel-gui/utils/cluster-storage/http-group';
import { NullDeviceGroup } from 'onepanel-gui/utils/cluster-storage/null-device-group';
import { LumaGroup } from 'onepanel-gui/utils/cluster-storage/luma-group';
import config from 'ember-get-config';
import notImplementedThrow from 'onedata-gui-common/utils/not-implemented-throw';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import stripObject from 'onedata-gui-common/utils/strip-object';
import _ from 'lodash';

/**
 * @typedef {EmberObject} ClusterStorageAddFormContext
 * @property {'create'|'edit'|'show'} editorMode
 * @property {Onepanel.StorageDetails} loadedStorage
 */

const {
  layoutConfig,
} = config;

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
   * @type {boolean}
   */
  isCredentialsEnabled: false,

  /**
   * @type {string}
   */
  lumaType: reads('fields.value.basic.lumaFeed'),

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

    return FormFieldsRootGroup
      .extend({
        i18nPrefix: computed('component.i18nPrefix', function i18nPrefix() {
          return `${this.component.i18nPrefix}.fields`;
        }),
        ownerSource: reads('component'),
        isEnabled: computed('component.isSubmitting', function isEnabled() {
          return !this.component.isSubmitting;
        }),
        fields: reads('component.fieldsArray'),
      })
      .create({
        component,
      });
  }),

  fieldsArray: computed(
    'storage',
    function fieldsArray() {
      const formContext = EmberObject.extend({
        editorMode: reads('component.mode'),
        loadedStorage: reads('component.storage'),
      }).create({ component: this });

      const fieldsList = [BasicGroup, LumaGroup];
      const fieldGroupClassMapping = {
        posix: PosixGroup,
        nfs: NfsGroup,
        s3: S3Group,
        swift: SwiftGroup,
        glusterfs: GlusterfsGroup,
        cephrados: CephRadosGroup,
        ceph: CephRadosGroup,
        http: HttpGroup,
        webdav: WebdavGroup,
        xrootd: XrootdGroup,
        nulldevice: NullDeviceGroup,
      };
      if (this.storage) {
        fieldsList.push(fieldGroupClassMapping[this.storage.type]);
      } else {
        delete fieldGroupClassMapping.ceph;
        fieldsList.push(...Object.values(fieldGroupClassMapping));
      }

      return fieldsList.map(
        (FieldClass) => FieldClass.create({ context: formContext })
      );
    }
  ),

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

  swiftGroup: computed('fields', function swiftGroup() {
    return this.fields.getFieldByPath('swift');
  }),

  webdavGroup: computed('fields', function webdavGroup() {
    return this.fields.getFieldByPath('webdav');
  }),

  httpGroup: computed('fields', function httpGroup() {
    return this.fields.getFieldByPath('http');
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
      this.setDefaultQosParams();
    }
  }),

  storageProvidesSupportObserver: observer(
    'storageProvidesSupport',
    function storageProvidesSupportObserver() {
      this.basicGroup.getFieldByPath('importedStorage')?.autoSettings();
    }
  ),

  modeObserver: observer('mode', function modeObserver() {
    if (this.storage) {
      this._fillInForm();
    }
    this.webdavGroup?.getFieldByPath('rangeWriteSupport')?.autoSettings();
    this.setDefaultQosParams();
  }),

  init() {
    this._super(...arguments);

    if (this.storage) {
      this._fillInForm();
    }
    if (this.mode !== 'show' && this.selectedStorageType) {
      this.setDefaultQosParams();
      this.webdavGroup?.getFieldByPath('rangeWriteSupport')?.autoSettings();
    }
  },

  _fillInFormGroup(formGroup, storage, valuesSourceGroup) {
    for (const field of formGroup.fields) {
      const name = field.name;

      if (name in storage && storage[name] !== undefined && storage[name] !== '') {
        valuesSourceGroup.set(name, storage[name]);
      } else {
        if ((storage.type === 'webdav' ||
            storage.type === 'http' ||
            storage.type === 'xrootd') &&
          (storage.credentialsType === 'basic' ||
            storage.credentialsType === 'pwd') &&
          (name === 'password' || name === 'username')
        ) {
          valuesSourceGroup.set(name, storage.credentials);
        } else {
          valuesSourceGroup.set(name, storage[name]);
        }
      }
    }
  },

  _fillInForm() {
    const { storage, fields } = this;
    let storageType = storage?.type;
    if (storageType === 'ceph') {
      storageType = 'cephrados';
    }

    this._fillInFormGroup(this.basicGroup, storage, fields.valuesSource.basic);

    if (storage.lumaFeed === 'external') {
      const lumaGroup = fields.getFieldByPath('luma');
      if (lumaGroup) {
        this._fillInFormGroup(lumaGroup, storage, fields.valuesSource.luma);
      }
    }

    const storageTypeGroup = fields.fields.find(
      (field) => field.name === storageType
    );

    if (storageTypeGroup) {
      this._fillInFormGroup(storageTypeGroup, storage, fields.valuesSource[storageType]);
    }
  },

  setDefaultQosParams() {
    this.setProperties({
      areQosParamsValid: true,
      editedQosParams: undefined,
    });
  },

  willDestroyElement() {
    this._super(...arguments);
    this.fields.destroy();
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
        if ((selectedStorageType === 'webdav' ||
            selectedStorageType === 'http' ||
            selectedStorageType === 'xrootd') &&
          (form[selectedStorageType].credentialsType === 'basic' ||
            form[selectedStorageType].credentialsType === 'pwd') &&
          (name === 'password' || name === 'username')
        ) {
          if (name === 'password') {
            continue;
          } else {
            formData.credentials = `${form[selectedStorageType].username}:${value}`;
          }
        } else {
          formData[name] = value;
        }
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
