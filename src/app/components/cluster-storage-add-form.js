/**
 * A form for adding new storage with all storage types available
 *
 * @module components/cluster-storage-add-form
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { next } from '@ember/runloop';

import EmberObject, { observer, computed, get, set } from '@ember/object';
import { inject as service } from '@ember/service';
import { invoke, invokeAction } from 'ember-invoke-action';
import { buildValidations } from 'ember-cp-validations';
import _ from 'lodash';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

import stripObject from 'onedata-gui-common/utils/strip-object';
import OneForm from 'onedata-gui-common/components/one-form';
import storageTypes from 'onepanel-gui/utils/cluster-storage/storage-types';
import GENERIC_FIELDS from 'onepanel-gui/utils/cluster-storage/generic-fields';
import LUMA_FIELDS from 'onepanel-gui/utils/cluster-storage/luma-fields';
import createFieldValidator from 'onedata-gui-common/utils/create-field-validator';

function createValidations(storageTypes, genericFields, lumaFields) {
  let validations = {};
  storageTypes.forEach(type => {
    type.fields.forEach(field => {
      let fieldName = 'allFieldsValues.' + type.id + '.' + field.name;
      validations[fieldName] = createFieldValidator(field);
    });
  });
  genericFields.forEach(field => {
    validations['allFieldsValues.generic.' + field.name] =
      createFieldValidator(field);
  });

  lumaFields.forEach(field => {
    validations['allFieldsValues.luma.' + field.name] =
      createFieldValidator(field);
  });
  return validations;
}

const Validations = buildValidations(createValidations(
  storageTypes, GENERIC_FIELDS, LUMA_FIELDS));

const VISIBILITY_ANIMATION_TIME = 333;

const storagePathTypeDefaults = {
  posix: 'canonical',
  glusterfs: 'canonical',
  nulldevice: 'canonical',
  ceph: 'flat',
  cephrados: 'flat',
  embeddedceph: 'flat',
  s3: 'flat',
  swift: 'flat',
  webdav: 'canonical',
};

export default OneForm.extend(Validations, {
  unknownFieldErrorMsg: 'component:cluster-storage-add-form: attempt to change not known input type',
  currentFieldsPrefix: computed('selectedStorageType.id', 'showLumaPrefix', function () {
    let {
      selectedStorageType,
      showLumaPrefix,
    } = this.getProperties('selectedStorageType', 'showLumaPrefix');
    if (showLumaPrefix) {
      return ['meta', 'generic', 'luma', selectedStorageType.id];
    } else {
      return ['meta', 'generic', selectedStorageType.id];
    }
  }),
  allFields: computed('storageTypes.@each.fields', 'genericFields', 'lumaFields',
    function () {
      let {
        storageTypes,
        genericFields,
        lumaFields,
      } = this.getProperties('storageTypes', 'genericFields', 'lumaFields');
      return storageTypes
        .concat([{ fields: genericFields }, { fields: lumaFields }])
        .map(type => type.fields)
        .reduce((a, b) => a.concat(b));
    }
  ),

  classNames: ['cluster-storage-add-form'],

  i18n: service(),
  navigationState: service(),
  cephManager: service(),

  /**
   * If true, form is visible to user
   * @type {boolean}
   */
  isFormOpened: false,

  showLumaPrefix: false,
  showLumaPrefixTimeoutId: -1,

  genericFields: null,
  lumaFields: null,
  storageTypes: computed(() =>
    storageTypes.map(type => _.assign({}, type))).readOnly(),

  selectedStorageType: null,

  allFieldsValues: computed('genericFields', 'lumaFields', 'storageTypes', function () {
    let fields = EmberObject.create({
      generic: EmberObject.create({}),
      luma: EmberObject.create({}),
      meta: EmberObject.create(),
    });
    let {
      genericFields,
      lumaFields,
      storageTypes,
    } = this.getProperties('genericFields', 'lumaFields', 'storageTypes');
    storageTypes.forEach(type => {
      fields.set(type.id, EmberObject.create({}));
      type.fields.forEach(field => fields.set(field.get('name'), null));
    });
    genericFields.concat(lumaFields).forEach(field =>
      fields.set(field.get('name'), null)
    );
    return fields;
  }),

  /**
   * @type {Ember.ComputedProperty<PromiseArray<Onepanel.CephOsd>>}
   */
  cephOsdsProxy: computed(function cephOsdsProxy() {
    return this.get('cephManager').getOsds();
  }),

  /**
   * @type {Ember.ComputedProperty<number>}
   */
  osdsNumberObserver: observer(
    'cephOsdsProxy.length',
    function osdsNumberObserver() {
      return this.set(
        'allFieldsValues.meta.osdsNumber',
        this.get('cephOsdsProxy.length') || 1
      );
    }
  ),

  /**
   * Resets field if form visibility changes (clears validation errors)
   */
  isFormOpenedObserver: observer('isFormOpened', function () {
    if (this.get('isFormOpened')) {
      this.resetFormValues();
      this.set('showLumaPrefix', false);
    }
  }),

  showLumaPrefixObserver: observer('showLumaPrefix', function () {
    // make luma fields transparent (for animation purposes)
    this.get('allFields').filter(f => f.get('name').startsWith('luma.'))
      .forEach(f => f.set('cssClass', 'transparent'));
    this.resetFormValues(['luma']);
  }),

  init() {
    this._super(...arguments);
    if (this.get('selectedStorageType') == null) {
      this.set('selectedStorageType',
        this.get('storageTypes.firstObject'));
    }
    this.set('genericFields', GENERIC_FIELDS.map(fields =>
      EmberObject.create(fields)));
    this.get('genericFields').forEach(field => {
      let fieldName = field.get('name');
      field.set('name', `generic.${fieldName}`);
    });
    this.set('lumaFields', LUMA_FIELDS.map(fields =>
      EmberObject.create(fields)));
    this.get('lumaFields').forEach(field => {
      let fieldName = field.get('name');
      field.set('name', `luma.${fieldName}`);
    });
    this.get('storageTypes').forEach(type =>
      type.fields = type.fields.map(field =>
        EmberObject.create(field))
    );
    this.get('storageTypes').forEach(type =>
      type.fields.forEach(field =>
        field.set('name', type.id + '.' + field.get('name')))
    );

    this.selectPreferredStorageType();
    this.prepareFields();
    this._addFieldsLabels();
    this.resetFormValues();
    this.osdsNumberObserver();
    this.get('cephOsdsProxy')
      .then(() => safeExec(this, 'introduceCephOsds'));
  },

  selectPreferredStorageType() {
    const prefferedTypeId =
      this.get('navigationState.queryParams.create_storage_form_type');
    if (prefferedTypeId) {
      const storageTypes = this.get('storageTypes');
      const preferredType = storageTypes.findBy('id', prefferedTypeId);
      this.set('selectedStorageType', preferredType);
      // const genericFields = this.get('genericFields');
      // debugger;
      // const typeField = genericFields.findBy('name', 'generic.type');
      // set(typeField, 'defaultValue', prefferedType);
    }
  },

  introduceCephOsds() {
    const {
      cephOsdsProxy,
      allFields,
      allFieldsValues,
    } = this.getProperties('cephOsdsProxy', 'allFields', 'allFieldsValues');
    const osdsNumber = get(cephOsdsProxy, 'length') || 1;
    const defaultPoolSize = osdsNumber > 1 ? 2 : 1;

    const poolSizeField = allFields.findBy('name', 'embeddedceph.poolSize');
    set(poolSizeField, 'defaultValue', defaultPoolSize);
    set(allFieldsValues, 'embeddedceph.poolSize', defaultPoolSize);
  },
  /**
   * @override
   */
  resetFormValues() {
    this._super(...arguments);
    this.set(
      'allFieldsValues.generic.storagePathType',
      storagePathTypeDefaults[this.get('selectedStorageType.id')]
    );
  },

  // TODO move to some helper or something  
  _addFieldsLabels() {
    let i18n = this.get('i18n');
    let {
      storageTypes,
      genericFields,
      lumaFields,
    } = this.getProperties('storageTypes', 'genericFields', 'lumaFields');
    storageTypes.forEach(({ id: typeId, fields }) => {
      fields.forEach(field =>
        this._addFieldLabelTranslation(typeId, field, i18n)
      );
    });
    genericFields.forEach(field =>
      this._addFieldLabelTranslation('generic', field, i18n)
    );
    lumaFields.forEach(field =>
      this._addFieldLabelTranslation('luma', field, i18n)
    );
  },

  _addFieldLabelTranslation(typeId, field, i18n) {
    if (!field.label) {
      field.set('label', i18n.t(
        `components.clusterStorageAddForm.${typeId}.${this.cutOffPrefix(field.name)}.name`
      ));
    }
    if (field.tip === true) {
      field.set('tip', i18n.t(
        `components.clusterStorageAddForm.${typeId}.${this.cutOffPrefix(field.name)}.tip`
      ));
    }
  },

  _toggleLumaPrefixAnimation(show) {
    let formGroup = this.$('[class*="field-luma-"]').parents('.form-group');
    formGroup
      .addClass('animated fast ' + (show ? 'fadeIn' : 'fadeOut'))
      .removeClass(show ? 'fadeOut' : 'fadeIn');
  },

  actions: {
    storageTypeChanged(type) {
      this.set('selectedStorageType', type);
      this.resetFormValues();
      this.set('showLumaPrefix', false);
    },

    inputChanged(fieldName, value) {
      this.changeFormValue(fieldName, value);
      if (fieldName === 'generic.lumaEnabled') {
        clearTimeout(this.get('showLumaPrefixTimeoutId'));
        if (value) {
          this.set('showLumaPrefix', value);
          // remove transparent class to avoid visibility issues after rerender
          setTimeout(() => this.get('allFields')
            .filter(f => f.get('name').startsWith('luma.'))
            .forEach(f => f.set('cssClass', '')), VISIBILITY_ANIMATION_TIME);
        } else {
          this.set('showLumaPrefixTimeoutId', setTimeout(
            () => this.set('showLumaPrefix', value),
            VISIBILITY_ANIMATION_TIME
          ));
        }
        next(() => this._toggleLumaPrefixAnimation(value));
      }
    },

    toggleChanged({ newValue, context }) {
      let fieldName = context.get('fieldName');
      invoke(this, 'inputChanged', fieldName, newValue);
    },

    focusOut(field) {
      field.set('changed', true);
      this.recalculateErrors();
    },

    submit() {
      let {
        formValues,
        currentFields,
        selectedStorageType,
      } = this.getProperties(
        'formValues',
        'currentFields',
        'selectedStorageType'
      );

      let formData = {
        type: selectedStorageType.id,
      };

      currentFields.forEach(({ name }) => {
        formData[this.cutOffPrefix(name)] = formValues.get(name);
      });

      return invokeAction(this, 'submit',
        stripObject(formData, [undefined, null, '']));
    },
  },
});
