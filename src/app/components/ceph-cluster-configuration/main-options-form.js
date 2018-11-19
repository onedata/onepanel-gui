import OneForm from 'onedata-gui-common/components/one-form';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import EmberObject, { computed, get, set, observer } from '@ember/object';
import { buildValidations } from 'ember-cp-validations';
import createFieldValidator from 'onedata-gui-common/utils/create-field-validator';

const editFieldDefinition = [{
  name: 'name',
  type: 'text',
}];

const allPrefixes = ['edit', 'static'];

const validationsProto = editFieldDefinition.reduce((proto, field) => {
  proto[`allFieldsValues.edit.${field.name}`] = createFieldValidator(field);
  return proto;
}, {});

export default OneForm.extend(I18n, buildValidations(validationsProto), {
  /**
   * @override
   */
  i18nPrefix: 'components.cephClusterConfiguration.mainOptionsForm',

  isStandalone: true,

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  mode: computed('isStandalone', function mode() {
    return this.get('isStandalone') ? 'show' : 'edit';
  }),

  /**
   * @virtual
   * @type {Utils/Ceph/ClusterMainConfiguration}
   */
  mainConfiguration: undefined,

  /**
   * @type {Ember.ComputedProperty<Array<FieldType>>}
   */
  fieldsSource: computed(function fieldsSource() {
    return editFieldDefinition.map(field => 
      Object.assign({}, field, { label: this.t(`fields.${field.name}.label`)})
    );
  }),

  /**
   * @type {Ember.ComputedProperty<Array<FieldType>>}
   */
  editFields: computed('fieldsSource', function editFields() {
    return this.get('fieldsSource').map(field => EmberObject.create(
      Object.assign({}, field, { name: 'edit.' + get(field, 'name')})
    ));
  }),

  /**
   * @type {Ember.ComputedProperty<Array<FieldType>>}
   */
  staticFields: computed('fieldsSource', function editFields() {
    return this.get('fieldsSource').map(field => EmberObject.create(
      Object.assign({}, field, {
        name: 'static.' + get(field, 'name'),
        type: 'static',
      })
    ));
  }),

  /**
   * @type {Ember.ComputedProperty<Array<FieldType>>}
   */
  allFields: computed('editFields', 'staticFields', function allFields() {
    const {
      editFields,
      staticFields,
    } = this.getProperties('editFields', 'staticFields');
    return editFields.concat(staticFields);
  }),

  /**
   * @type {Ember.ComputedProperty<EmberObject>}
   */
  allFieldsValues: computed('allFields', function allFieldsValues() {
    const values = EmberObject.create({});
    allPrefixes.forEach(prefix => values.set(prefix, EmberObject.create()));
    return values;
  }),

  /**
   * @type {Ember.ComputedProperty<Array<string>>}
   */
  currentFieldsPrefix: computed('mode', function currentFieldsPrefix() {
    const mode = this.get('mode');
    return mode === 'edit' ? ['edit'] : ['static'];
  }),

  mainConfigurationObserver: observer(
    'mainConfiguration',
    'mode',
    'allFields',
    function managerMonitorObserver() {
    const {
      mainConfiguration,
      mode,
      allFields,
    } = this.getProperties('mainConfiguration', 'mode', 'allFields');
      ['name'].forEach(fieldName => {
        const value = get(mainConfiguration, fieldName);
        const staticField =
          allFields.findBy('name', `static.${fieldName}`);
        set(staticField, 'defaultValue', value);
        this.set(`allFieldsValues.static.${fieldName}`, value);
        
        if (value !== undefined || mode !== 'create') {
          const field = allFields.findBy('name', `edit.${fieldName}`);
          set(field, 'defaultValue', value); 
          if (!get(field, 'changed')) {
            this.set(`allFieldsValues.edit.${fieldName}`, value);
          }
        }
      });
      this.recalculateErrors();
    }
  ),

  init() {
    this._super(...arguments);
    this.mainConfigurationObserver();
  },

  constructConfig() {
    const name = this.get('allFieldsValues.edit.name');
    const config = {
      name,
    };
    return config;
  },

  applyChange() {
    this.get('mainConfiguration')
      .fillIn(this.constructConfig(), this.get('isValid'));
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
