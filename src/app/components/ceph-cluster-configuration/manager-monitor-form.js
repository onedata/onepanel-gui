/**
 * Provides form for showing, creating and modifying manager & monitor ceph settings.
 * 
 * @module components/ceph-cluster-configuration/manager-monitor-form
 * @author Michał Borzęcki
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OneForm from 'onedata-gui-common/components/one-form';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import EmberObject, { computed, get, set, observer } from '@ember/object';
import { buildValidations } from 'ember-cp-validations';
import createFieldValidator from 'onedata-gui-common/utils/create-field-validator';

const editFieldDefinition = [{
  name: 'monitorIp',
  type: 'text',
  regex: /^\d+\.\d+\.\d+\.\d+/,
  regexAllowBlank: true,
  optional: true,
  cssClass: 'form-group-sm',
}];

const allPrefixes = ['edit', 'static'];

const validationsProto = editFieldDefinition.reduce((proto, field) => {
  proto[`allFieldsValues.edit.${field.name}`] = createFieldValidator(field);
  return proto;
}, {});

export default OneForm.extend(I18n, buildValidations(validationsProto), {
  classNames: ['manager-monitor-form'],
  classNameBindings: ['shouldBeHidden:hide'],

  /**
   * @override
   */
  i18nPrefix: 'components.cephClusterConfiguration.managerMonitorForm',

  /**
   * @type {boolean}
   */
  isCephDeployed: true,

  /**
   * @virtual
   * @type {Utils/Ceph/ManagerMonitorConfiguration}
   */
  managerMonitor: undefined,

  /**
   * @type {string}
   */
  mode: computed('isCephDeployed', function mode() {
    // For now form is readonly in standalone mode. Edition will be implemented later.
    return this.get('isCephDeployed') ? 'show' : 'create';
  }),

  /**
   * @type {Ember.ComputedProperty<Array<FieldType>>}
   */
  fieldsSource: computed(function fieldsSource() {
    return editFieldDefinition.map(field =>
      Object.assign({}, field, { label: this.t(`fields.${field.name}.label`) })
    );
  }),

  /**
   * @type {Ember.ComputedProperty<Array<FieldType>>}
   */
  editFields: computed('fieldsSource', function editFields() {
    return this.get('fieldsSource').map(field => EmberObject.create(
      Object.assign({}, field, { name: 'edit.' + get(field, 'name') })
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
    return ['edit', 'create'].includes(mode) ? ['edit'] : ['static'];
  }),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  shouldBeHidden: computed('mode', 'managerMonitor.monitorIp', function shouldBeHidden() {
    const {
      mode,
      managerMonitor,
    } = this.getProperties('mode', 'managerMonitor');
    // is in 'show' mode and all field are empty
    return mode === 'show' && !get(managerMonitor, 'monitorIp');
  }),

  managerMonitorObserver: observer(
    'managerMonitor',
    'mode',
    'allFields',
    function managerMonitorObserver() {
      const {
        managerMonitor,
        mode,
        allFields,
      } = this.getProperties('managerMonitor', 'mode', 'allFields');
      // Working with array because there may be more fields in the future.
      ['monitorIp'].forEach(fieldName => {
        const value = get(managerMonitor, fieldName);
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
    this.managerMonitorObserver();
  },

  /**
   * Generates JSON config object with values from form.
   * @returns {Object}
   */
  constructConfig() {
    const monitorIp = this.get('allFieldsValues.edit.monitorIp') || undefined;
    const config = {
      monitorIp,
    };
    return config;
  },

  /**
   * Applies actual state of the form to the config object.
   * @returns {undefined}
   */
  applyChange() {
    this.get('managerMonitor').fillIn(this.constructConfig(), this.get('isValid'));
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
