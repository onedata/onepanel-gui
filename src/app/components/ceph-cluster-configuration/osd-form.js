import I18n from 'onedata-gui-common/mixins/components/i18n';
import OneForm from 'onedata-gui-common/components/one-form';
import createFieldValidator from 'onedata-gui-common/utils/create-field-validator';
import { buildValidations } from 'ember-cp-validations';
import EmberObject, { computed, observer, get, set, getProperties } from '@ember/object';
import { union } from '@ember/object/computed';
import notImplementedThrow from 'onedata-gui-common/utils/not-implemented-throw';
import _ from 'lodash';
import { validator } from 'ember-cp-validations';

const editTypeFieldDefinition = [{
  name: 'type',
  type: 'radio-group',
  options: [{
    value: 'bluestore',
  }, {
    value: 'filestore',
  }],
  defaultValue: 'bluestore',
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
  { prefix: 'editType', fields: editTypeFieldDefinition },
  { prefix: 'editBluestore', fields: editBluestoreFieldsDefinition },
  { prefix: 'editFilestore', fields: editFilestoreFieldsDefinition },
].forEach(({ prefix, fields }) => {
  fields.reduce((proto, field) => {
    proto[`allFieldsValues.${prefix}.${field.name}`] = createFieldValidator(field);
    return proto;
  }, validationsProto);
});

const usedDeviceValidator = validator(function (value, options, model) {
  if (!value) {
    return true;
  } else {
    const deviceId = get(get(model, 'devices').findBy('name', value), 'id');
    const msg = get(this.get('model').t('deviceAlreadyUsed'), 'string');
    return get(model, 'usedDevices.' + deviceId) < 2 ? true : msg;
  }
}, {
  dependentKeys: ['model.usedDevices'],
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
   * @type {Array<Object>}
   */
  devices: undefined,

  /**
   * @type {Object}
   */
  usedDevices: undefined,

  /**
   * @virtual
   * @type {string}
   */
  mode: 'show',

  /**
   * @type {boolean}
   */
  isStandalone: true,

  /**
   * @virtual optional
   * @type {boolean}
   */
  allowsEdition: false,

  /**
   * @virtual
   * @type {function}
   * @returns {undefined}
   */
  removeOsd: notImplementedThrow,

  usedDevicesObserver: observer('usedDevices', function usedDevicesObserver() {
    this.recalculateErrors();
  }),

  filledEditBluestoreFieldsDefinition: computed(
    'devices.[]',
    function filledEditBluestoreFieldsDefinition() {
      const fields = _.cloneDeep(editBluestoreFieldsDefinition);
      const deviceOptions = this.get('devices').map(device => {
        const {
          name,
          descriptiveName,
        } = getProperties(device, 'name', 'descriptiveName');

        return {
          value: name,
          label: descriptiveName,
        };
      });
      fields.forEach(field =>
        set(field, 'options', deviceOptions.slice(0))
      );
      const dbDeviceField = fields.findBy('name', 'dbDevice');
      get(dbDeviceField, 'options').unshift({
        value: 0,
        label: ' ',
      });
      return fields;
    }
  ),

  editTypeFields: computed(function editTypeFields() {
    return editTypeFieldDefinition.map(f =>
      this.prepareField(f, 'editType')
    );
  }),

  editBluestoreFields: computed(
    'filledEditBluestoreFieldsDefinition',
    function editBluestoreFields() {
      return this.get('filledEditBluestoreFieldsDefinition').map(f =>
        this.prepareField(f, 'editBluestore')
      );
    }
  ),

  editFilestoreFields: computed(function editFilestoreFields() {
    return editFilestoreFieldsDefinition.map(f =>
      this.prepareField(f, 'editFilestore')
    );
  }),

  staticTypeFields: computed(function editTypeFields() {
    return editTypeFieldDefinition.map(f =>
      this.prepareField(f, 'staticType', true)
    );
  }),

  staticBluestoreFields: computed(function staticBluestoreFields() {
    return editBluestoreFieldsDefinition.map(f =>
      this.prepareField(f, 'staticBluestore', true)
    );
  }),

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
      if (mode === 'edit' || mode === 'create') {
        prefixes.push('editType');
        const type = this.get('allFieldsValues.editType.type');
        prefixes.push(type === 'bluestore' ? 'editBluestore' : 'editFilestore');
      } else {
        prefixes.push('staticType');
        const type = this.get('allFieldsValues.staticType.type');
        prefixes.push(type === 'bluestore' ? 'staticBluestore' : 'staticFilestore');
      }
      return prefixes;
    }
  ),

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
      mode,
      allFields,
    } = this.getProperties('osd', 'mode', 'allFields');
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
          this.translateStaticValue(prefix, osdFieldName, value)
        );
        
        if (value !== undefined || mode !== 'create') {
          const field = allFields.findBy('name', `edit${prefix}.${osdFieldName}`);
          set(field, 'defaultValue', value); 
          if (!get(field, 'changed')) {
            this.set(`allFieldsValues.edit${prefix}.${osdFieldName}`, value);
          }
        }
      });
    });
    this.recalculateErrors();
  }),

  init() {
    this._super(...arguments);
    this.prepareFields();

    if (!this.get('isStandalone')) {
      this.set('mode', 'create');
    }
    
    this.osdObserver();
    if (this.get('mode') === 'create') {
      const device = this.get('allFieldsValues.editBluestore.device');
      if (device) {
        // mark field as modified to show "used device" error
        this.changeFormValue('editBluestore.device', device);
      }
    }
  },

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

  translateStaticValue(prefix, fieldName, value) {
    if (value) {
      switch(fieldName) {
        case 'type':
          return this.t(`fields.type.options.${value}`);
        default:
          return value;
      }
    } else {
      return value;
    }
  },

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
      dbDevice,
      path,
    };
    return config;
  },

  applyChange() {
    this.get('osd').fillIn(this.constructConfig(), this.get('isFormValid'));
  },

  actions: {
    inputChanged(fieldName, value) {
      this.changeFormValue(fieldName, value);
      this.applyChange();
    },

    focusOut(field) {
      field.set('changed', true);
      this.recalculateErrors();
    },
  },
});
