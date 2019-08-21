/**
 * Provides form for showing and creating osd settings.
 * 
 * @module components/ceph-cluster-configuration/osd-form
 * @author Michał Borzęcki
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import I18n from 'onedata-gui-common/mixins/components/i18n';
import OneForm from 'onedata-gui-common/components/one-form';
import createFieldValidator from 'onedata-gui-common/utils/create-field-validator';
import { buildValidations } from 'ember-cp-validations';
import EmberObject, { computed, observer, get, set, getProperties } from '@ember/object';
import { union } from '@ember/object/computed';
import notImplementedThrow from 'onedata-gui-common/utils/not-implemented-throw';
import _ from 'lodash';
import { validator } from 'ember-cp-validations';
import { conditional, raw } from 'ember-awesome-macros';

const editTypeFieldsDefinition = [{
  name: 'type',
  type: 'radio-group',
  options: [{
    value: 'bluestore',
  }, {
    value: 'filestore',
  }],
  defaultValue: 'filestore',
}];

const editBluestoreFieldsDefinition = [{
  name: 'device',
  type: 'dropdown',
}, {
  name: 'dbDevice',
  type: 'dropdown',
  optional: true,
}];

const editFilestoreFieldsDefinition = [{
  name: 'path',
  type: 'text',
  optional: true,
}];

const allPrefixes = [
  'editType',
  'staticType',
  'editBluestore',
  'staticBluestore',
  'editFilestore',
  'staticFilestore',
];

const validationsProto = {};
[
  { prefix: 'editType', fields: editTypeFieldsDefinition },
  { prefix: 'editBluestore', fields: editBluestoreFieldsDefinition },
  { prefix: 'editFilestore', fields: editFilestoreFieldsDefinition },
].forEach(({ prefix, fields }) => {
  fields.reduce((proto, field) => {
    proto[`allFieldsValues.${prefix}.${field.name}`] = createFieldValidator(field);
    return proto;
  }, validationsProto);
});

const usedDeviceValidator = validator(function (value, options, model) {
  if (!value || get(model, 'mode') === 'show') {
    return true;
  } else {
    const deviceId = get(get(model, 'devices').findBy('path', value) || {}, 'id');
    const msg = get(this.get('model').t('deviceAlreadyUsed'), 'string');
    return (!deviceId || get(model, 'usedDevices.' + deviceId) < 2) ? true : msg;
  }
}, {
  dependentKeys: ['model.{usedDevices,mode}'],
});
[
  'allFieldsValues.editBluestore.device',
  'allFieldsValues.editBluestore.dbDevice',
].forEach(field => validationsProto[field].push(usedDeviceValidator));

export default OneForm.extend(I18n, buildValidations(validationsProto), {
  classNames: ['row', 'content-row', 'osd-section'],

  /**
   * @override
   */
  i18nPrefix: 'components.cephClusterConfiguration.osdForm',

  /**
   * @virtual
   * @type {Object}
   */
  osd: undefined,

  /**
   * @virtual
   * @type {Array<Object>}
   */
  devices: undefined,

  /**
   * @virtual
   * @type {Object}
   */
  usedDevices: undefined,

  /**
   * @virtual
   * @type {boolean}
   */
  isCephDeployed: true,

  /**
   * @type {boolean}
   */
  allowsEdition: false,

  /**
   * @virtual
   * @type {function}
   * @returns {undefined}
   */
  removeOsd: notImplementedThrow,

  /**
   * @type {string}
   */
  mode: conditional('isCephDeployed', raw('show'), raw('edit')),

  /**
   * Bluestore edit fields with devices converted to device dropdown options.
   * @type {Ember.ComputedProperty<Array<FieldType>>}
   */
  filledEditBluestoreFieldsDefinition: computed(
    'devices.@each.{mounted,path}',
    function filledEditBluestoreFieldsDefinition() {
      const fields = _.cloneDeep(editBluestoreFieldsDefinition);
      const deviceOptions = this.get('devices')
        // Mounted devices should not be used as OSD device for safety reasons
        // (to avoid unintentional data lost).
        .rejectBy('mounted')
        .map(device => {
          const {
            path,
            descriptiveName,
          } = getProperties(device, 'path', 'descriptiveName');

          return {
            value: path,
            label: descriptiveName,
          };
        });
      fields.forEach(field =>
        set(field, 'options', deviceOptions.slice(0))
      );
      const dbDeviceField = fields.findBy('name', 'dbDevice');
      get(dbDeviceField, 'options').unshift({
        // 0 because power-select internally tries to treat value as an object
        // (access its' properties), so undefined and null are triggering
        // exceptions.
        value: 0,
        label: ' ',
      });
      return fields;
    }
  ),

  /**
   * @type {Ember.ComputedProperty<Array<FieldType>>}
   */
  editTypeFields: computed(function editTypeFields() {
    return editTypeFieldsDefinition.map(f =>
      this.prepareField(f, 'editType')
    );
  }),

  /**
   * @type {Ember.ComputedProperty<Array<FieldType>>}
   */
  editBluestoreFields: computed(
    'filledEditBluestoreFieldsDefinition',
    function editBluestoreFields() {
      return this.get('filledEditBluestoreFieldsDefinition').map(f =>
        this.prepareField(f, 'editBluestore')
      );
    }
  ),

  /**
   * @type {Ember.ComputedProperty<Array<FieldType>>}
   */
  editFilestoreFields: computed(function editFilestoreFields() {
    return editFilestoreFieldsDefinition.map(f =>
      this.prepareField(f, 'editFilestore')
    );
  }),

  /**
   * @type {Ember.ComputedProperty<Array<FieldType>>}
   */
  staticTypeFields: computed(function staticTypeFields() {
    return editTypeFieldsDefinition.map(f =>
      this.prepareField(f, 'staticType', true)
    );
  }),

  /**
   * @type {Ember.ComputedProperty<Array<FieldType>>}
   */
  staticBluestoreFields: computed(function staticBluestoreFields() {
    return editBluestoreFieldsDefinition.map(f =>
      this.prepareField(f, 'staticBluestore', true)
    );
  }),

  /**
   * @type {Ember.ComputedProperty<Array<FieldType>>}
   */
  staticFilestoreFields: computed(function staticFilestoreFields() {
    return editFilestoreFieldsDefinition.map(f =>
      this.prepareField(f, 'staticFilestore', true)
    );
  }),

  /**
   * @type {Ember.ComputedProperty<Array<FieldType>>}
   */
  allFields: union(
    'editTypeFields',
    'editBluestoreFields',
    'editFilestoreFields',
    'staticTypeFields',
    'staticBluestoreFields',
    'staticFilestoreFields'
  ),

  /**
   * @type {Ember.ComputedProperty<EmberObject>}
   */
  allFieldsValues: computed('allFields', function allFieldsValues() {
    const values = EmberObject.create({});
    allPrefixes.forEach(prefix => values.set(prefix, EmberObject.create()));
    this.get('allFields').forEach(field =>
      set(values, get(field, 'name'), get(field, 'defaultValue'))
    );
    return values;
  }),

  /**
   * @type {Ember.ComputedProperty<Array<string>>}
   */
  currentFieldsPrefix: computed(
    'mode',
    'allFieldsValues.{editType.type,staticType.type}',
    function currentFieldsPrefix() {
      const mode = this.get('mode');
      const prefixes = [];
      if (mode === 'edit') {
        prefixes.push('editType');
        const type = this.get('allFieldsValues.editType.type');
        prefixes.push(type === 'bluestore' ? 'editBluestore' : 'editFilestore');
      } else {
        prefixes.push('staticType');
        const type = this.get('allFieldsValues.staticType.type');
        prefixes.push(
          type === get(this.t('fields.type.options.bluestore'), 'string') ?
          'staticBluestore' : 'staticFilestore'
        );
      }
      return prefixes;
    }
  ),

  /**
   * True if form values are valid. device and dbDevice fields are not taken
   * into account (are checked by internal config mechanisms).
   * @type {Ember.ComputedProperty<boolean>}
   */
  isFormValid: computed('errors', function isFormValid() {
    const errors = this.get('errors').filter(error => ![
      'allFieldsValues.editBluestore.device',
      'allFieldsValues.editBluestore.dbDevice',
    ].includes(get(error, 'attribute')));
    return get(errors, 'length') === 0;
  }),

  osdObserver: observer('osd', 'mode', 'allFields', function osdObserver() {
    const {
      osd,
      allFields,
    } = this.getProperties('osd', 'allFields');
    [
      ['Type', ['type']],
      ['Bluestore', ['device', 'dbDevice']],
      ['Filestore', ['path']],
    ].forEach(([prefix, osdFieldNames]) => {
      osdFieldNames.forEach(osdFieldName => {
        const value = get(osd, osdFieldName);
        const staticField =
          allFields.findBy('name', `static${prefix}.${osdFieldName}`);
        set(staticField, 'defaultValue', value);
        this.set(
          `allFieldsValues.static${prefix}.${osdFieldName}`,
          this.translateStaticValue(osdFieldName, value)
        );

        const field = allFields.findBy(
          'name',
          `edit${prefix}.${osdFieldName}`
        );
        set(field, 'defaultValue', value);
        if (!get(field, 'changed')) {
          this.set(`allFieldsValues.edit${prefix}.${osdFieldName}`, value);
        }
      });
    });
    this.recalculateErrors();
  }),

  usedDevicesObserver: observer('usedDevices', function usedDevicesObserver() {
    this.recalculateErrors();
  }),

  init() {
    this._super(...arguments);
    this.prepareFields();

    this.osdObserver();
    this.exposeInjectedDataErrors();
  },

  /**
   * Sets up classes, translations etc. for given field.
   * @param {FieldType} field 
   * @param {string} prefix 
   * @param {boolean} isStatic
   * @return {FieldType}
   */
  prepareField(field, prefix, isStatic = false) {
    const {
      type,
      name,
    } = getProperties(field, 'type', 'name');

    field = Object.assign({}, field, {
      name: `${prefix}.${name}`,
      label: this.t(`fields.${name}.label`),
      type: isStatic ? 'static' : type,
      cssClass: 'form-group-sm',
    });
    if ((type === 'radio-group' || type === 'dropdown') && !isStatic) {
      set(field, 'options', get(field, 'options').map(option => {
        const label = get(option, 'label');
        return Object.assign({}, option, {
          label: label ?
            label : this.t(`fields.${name}.options.${get(option, 'value')}`),
        });
      }));
    }
    return EmberObject.create(field);
  },

  /**
   * Returns translation of the static field value (static fields does not format
   * value like edition fields).
   * @param {string} fieldName 
   * @param {string} value
   * @returns {string} translation
   */
  translateStaticValue(fieldName, value) {
    if (value) {
      switch (fieldName) {
        case 'type':
          return get(this.t(`fields.type.options.${value}`), 'string');
        default:
          return value;
      }
    } else {
      return value;
    }
  },

  /**
   * Generates JSON config object with values from form.
   * @returns {Object}
   */
  constructConfig() {
    const {
      editType,
      editBluestore,
      editFilestore,
    } = getProperties(
      this.get('allFieldsValues'),
      'editType',
      'editBluestore',
      'editFilestore'
    );
    const type = get(editType, 'type');
    const {
      device,
      dbDevice,
    } = getProperties(editBluestore, 'device', 'dbDevice');
    const path = get(editFilestore, 'path');

    const config = {
      id: this.get('osd.id'),
      type,
      device,
      dbDevice: dbDevice === 0 ? undefined : dbDevice,
      path,
    };
    return config;
  },

  /**
   * When data is injected at the beginning of the component lifecycle, then
   * form values are recognized as not modified, so errors are not visible.
   * Calling this method will programatically mark non-empty fields as modified
   * to show their validation state.
   * @returns {undefined}
   */
  exposeInjectedDataErrors() {
    [
      'editBluestore.device',
      'editBluestore.dbDevice',
    ].forEach(fieldName => {
      const value = this.get(`allFieldsValues.${fieldName}`);
      if (value) {
        this.changeFormValue(fieldName, value);
      }
    });
  },

  /**
   * Applies actual state of the form to the config object.
   * @returns {undefined}
   */
  applyChange() {
    this.get('osd').fillIn(this.constructConfig(), this.get('isFormValid'));
  },

  actions: {
    inputChanged(fieldName, value) {
      this.changeFormValue(fieldName, value);
      this.applyChange();
      if (fieldName === 'editType.type') {
        this.exposeInjectedDataErrors();
      }
    },

    focusOut(field) {
      field.set('changed', true);
      this.recalculateErrors();
    },
  },
});
