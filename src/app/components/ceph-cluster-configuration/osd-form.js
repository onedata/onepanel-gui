// TODO: VFS-9257 fix eslint issues in this file
/* eslint-disable no-param-reassign */

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
import bytesToString from 'onedata-gui-common/utils/bytes-to-string';
import config from 'ember-get-config';
import { inject as service } from '@ember/service';

const {
  layoutConfig: globalLayoutConfig,
} = config;

const editTypeFieldsDefinition = [{
  name: 'type',
  type: 'radio-group',
  options: [{
    value: 'blockdevice',
  }, {
    value: 'loopdevice',
  }],
  defaultValue: 'loopdevice',
  tip: true,
}];

const editBlockdeviceFieldsDefinition = [{
  name: 'device',
  type: 'dropdown',
  tip: true,
}];

const editLoopdeviceFieldsDefinition = [{
  name: 'path',
  type: 'text',
  regex: /^\/.*[^/]$/,
  tip: true,
}, {
  name: 'size',
  type: 'capacity',
  gt: 0,
  tip: true,
}];

const allPrefixes = [
  'editType',
  'staticType',
  'editBlockdevice',
  'staticBlockdevice',
  'editLoopdevice',
  'staticLoopdevice',
];

const validationsProto = {};
[
  { prefix: 'editType', fields: editTypeFieldsDefinition },
  { prefix: 'editBlockdevice', fields: editBlockdeviceFieldsDefinition },
  { prefix: 'editLoopdevice', fields: editLoopdeviceFieldsDefinition },
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
    if (!deviceId || get(model, 'usedDevices.' + deviceId) < 2) {
      return true;
    } else {
      return get(this.get('model').t('deviceAlreadyUsed'), 'string');
    }
  }
}, {
  dependentKeys: ['model.{usedDevices,mode}'],
});
validationsProto['allFieldsValues.editBlockdevice.device'].push(usedDeviceValidator);

export default OneForm.extend(I18n, buildValidations(validationsProto), {
  classNames: ['row', 'content-row', 'osd-form'],
  classNameBindings: ['modeClass'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.cephClusterConfiguration.osdForm',

  /**
   * @type {Object}
   */
  showLayoutConfig: undefined,

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
   * @type {Ember.ComputedProperty<Object>}
   */
  layoutConfig: computed('mode', 'editLayoutConfig', function layoutConfig() {
    const {
      mode,
      showLayoutConfig,
    } = this.getProperties('mode', 'showLayoutConfig');
    return mode === 'show' ? showLayoutConfig : globalLayoutConfig;
  }),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  mode: conditional('isCephDeployed', raw('show'), raw('edit')),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  modeClass: computed('mode', function modeClass() {
    return 'mode-' + this.get('mode');
  }),

  /**
   * Blockdevice edit fields with devices converted to device dropdown options.
   * @type {Ember.ComputedProperty<Array<FieldType>>}
   */
  filledEditBlockdeviceFieldsDefinition: computed(
    'devices.@each.{mounted,path}',
    function filledEditBlockdeviceFieldsDefinition() {
      const fields = _.cloneDeep(editBlockdeviceFieldsDefinition);
      const deviceOptions = this.get('devices')
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
  editBlockdeviceFields: computed(
    'filledEditBlockdeviceFieldsDefinition',
    function editBlockdeviceFields() {
      return this.get('filledEditBlockdeviceFieldsDefinition').map(f =>
        this.prepareField(f, 'editBlockdevice')
      );
    }
  ),

  /**
   * @type {Ember.ComputedProperty<Array<FieldType>>}
   */
  editLoopdeviceFields: computed(function editLoopdeviceFields() {
    return editLoopdeviceFieldsDefinition.map(f =>
      this.prepareField(f, 'editLoopdevice')
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
  staticBlockdeviceFields: computed(function staticBlockdeviceFields() {
    return editBlockdeviceFieldsDefinition.map(f =>
      this.prepareField(f, 'staticBlockdevice', true)
    );
  }),

  /**
   * @type {Ember.ComputedProperty<Array<FieldType>>}
   */
  staticLoopdeviceFields: computed(function staticLoopdeviceFields() {
    return editLoopdeviceFieldsDefinition.map(f =>
      this.prepareField(f, 'staticLoopdevice', true)
    );
  }),

  /**
   * @type {Ember.ComputedProperty<Array<FieldType>>}
   */
  allFields: union(
    'editTypeFields',
    'editBlockdeviceFields',
    'editLoopdeviceFields',
    'staticTypeFields',
    'staticBlockdeviceFields',
    'staticLoopdeviceFields'
  ),

  /**
   * @type {Ember.ComputedProperty<EmberObject>}
   */
  allFieldsValues: computed('allFields', function allFieldsValues() {
    const values = EmberObject.create();
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
        prefixes.push(type === 'blockdevice' ? 'editBlockdevice' : 'editLoopdevice');
      } else {
        prefixes.push('staticType');
        const type = this.get('allFieldsValues.staticType.type');
        prefixes.push(
          type === get(this.t('fields.type.options.blockdevice'), 'string') ?
          'staticBlockdevice' : 'staticLoopdevice'
        );
      }
      return prefixes;
    }
  ),

  /**
   * True if form values are valid. device field is not taken
   * into account (is checked by internal config mechanisms).
   * @type {Ember.ComputedProperty<boolean>}
   */
  isFormValid: computed('errors', function isFormValid() {
    const errors = this.get('errors')
      .rejectBy('attribute', 'allFieldsValues.editBlockdevice.device');
    return get(errors, 'length') === 0;
  }),

  osdObserver: observer('osd', 'mode', 'allFields', function osdObserver() {
    this.reassignOsdValuesToFields();
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

  reassignOsdValuesToFields() {
    const {
      osd,
      allFields,
    } = this.getProperties('osd', 'allFields');
    [
      ['Type', ['type']],
      ['Blockdevice', ['device']],
      ['Loopdevice', ['path', 'size']],
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
  },

  /**
   * Sets up classes, translations etc. for given field.
   * @param {FieldType} field
   * @param {string} prefix
   * @param {boolean} isStatic
   * @returns {FieldType}
   */
  prepareField(field, prefix, isStatic = false) {
    const {
      type,
      name,
      tip,
    } = getProperties(field, 'type', 'name', 'tip');

    field = Object.assign({}, field, {
      name: `${prefix}.${name}`,
      label: this.t(`fields.${name}.label`),
      type: isStatic ? 'static' : type,
      cssClass: 'form-group-sm',
      tip: (tip && !isStatic) ? this.t(`fields.${name}.tip`) : undefined,
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
        case 'size':
          return typeof value === 'number' ? bytesToString(value) : undefined;
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
      allFieldsValues,
      osd,
    } = this.getProperties('allFieldsValues', 'osd');
    const {
      editType,
      editBlockdevice,
      editLoopdevice,
    } = getProperties(
      allFieldsValues,
      'editType',
      'editBlockdevice',
      'editLoopdevice'
    );
    const type = get(editType, 'type');
    const device = get(editBlockdevice, 'device');
    const {
      path,
      size,
    } = getProperties(editLoopdevice, 'path', 'size');
    const {
      id,
      uuid,
    } = getProperties(osd, 'id', 'uuid');

    const config = {
      id,
      uuid,
      type,
      device,
      path,
      size,
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
      'editBlockdevice.device',
      'editLoopdevice.path',
      'editLoopdevice.size',
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
