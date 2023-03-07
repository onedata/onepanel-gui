/**
 * Provides form for showing, creating and modifying manager & monitor ceph settings.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OneForm from 'onedata-gui-common/components/one-form';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import EmberObject, {
  computed,
  get,
  set,
  observer,
  getProperties,
} from '@ember/object';
import { union } from '@ember/object/computed';
import { buildValidations } from 'ember-cp-validations';
import createFieldValidator from 'onedata-gui-common/utils/create-field-validator';
import { conditional, raw, equal } from 'ember-awesome-macros';
import config from 'ember-get-config';
import { inject as service } from '@ember/service';

const {
  layoutConfig: globalLayoutConfig,
} = config;

const editFieldsDefinition = [{
  name: 'monitorIp',
  type: 'text',
  regex: /^\d+\.\d+\.\d+\.\d+/,
  regexAllowBlank: true,
  optional: true,
  cssClass: 'form-group-sm',
  tip: true,
}];

const allPrefixes = ['edit', 'static'];

const validationsProto = editFieldsDefinition.reduce((proto, field) => {
  proto[`allFieldsValues.edit.${field.name}`] = createFieldValidator(field);
  return proto;
}, {});

export default OneForm.extend(I18n, buildValidations(validationsProto), {
  classNames: ['manager-monitor-form'],
  classNameBindings: ['modeClass', 'shouldBeHidden:hide'],

  i18n: service(),

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
   * @type {Ember.ComputedProperty<string>}
   */
  mode: conditional('isCephDeployed', raw('show'), raw('edit')),

  modeClass: computed('mode', function modeClass() {
    return 'mode-' + this.get('mode');
  }),

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
   * @type {Ember.ComputedProperty<Array<FieldType>>}
   */
  editFieldsSource: computed(function editFieldsSource() {
    return editFieldsDefinition.map(field => {
      const {
        name,
        tip,
      } = getProperties(field, 'name', 'tip');
      return Object.assign({}, field, {
        label: this.t(`fields.${name}.label`),
        tip: tip ? this.t(`fields.${name}.tip`) : undefined,
      });
    });
  }),

  /**
   * @type {Ember.ComputedProperty<Array<FieldType>>}
   */
  editFields: computed('editFieldsSource', function editFields() {
    return this.get('editFieldsSource').map(field => EmberObject.create(
      Object.assign({}, field, { name: 'edit.' + get(field, 'name') })
    ));
  }),

  /**
   * @type {Ember.ComputedProperty<Array<FieldType>>}
   */
  staticFields: computed('editFieldsSource', function staticFields() {
    return this.get('editFieldsSource').map(field => EmberObject.create(
      Object.assign({}, field, {
        name: 'static.' + get(field, 'name'),
        type: 'static',
        tip: undefined,
      })
    ));
  }),

  /**
   * @type {Ember.ComputedProperty<Array<FieldType>>}
   */
  allFields: union('editFields', 'staticFields'),

  /**
   * @type {Ember.ComputedProperty<EmberObject>}
   */
  allFieldsValues: computed('allFields', function allFieldsValues() {
    const values = EmberObject.create();
    allPrefixes.forEach(prefix => values.set(prefix, EmberObject.create()));
    return values;
  }),

  /**
   * @type {Ember.ComputedProperty<Array<string>>}
   */
  currentFieldsPrefix: conditional(
    equal('mode', raw('edit')),
    raw(['edit']),
    raw(['static']),
  ),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  shouldBeHidden: computed(
    'mode',
    'managerMonitor.monitorIp',
    function shouldBeHidden() {
      const {
        mode,
        managerMonitor,
      } = this.getProperties('mode', 'managerMonitor');
      // is in 'show' mode and all field are empty
      return mode === 'show' && !get(managerMonitor, 'monitorIp');
    }
  ),

  managerMonitorObserver: observer(
    'managerMonitor',
    'mode',
    'allFields',
    function managerMonitorObserver() {
      const {
        managerMonitor,
        allFields,
      } = this.getProperties('managerMonitor', 'allFields');
      // Working with array because there may be more fields in the future.
      ['monitorIp'].forEach(fieldName => {
        const value = get(managerMonitor, fieldName);
        const staticField =
          allFields.findBy('name', `static.${fieldName}`);
        set(staticField, 'defaultValue', value);
        this.set(`allFieldsValues.static.${fieldName}`, value);

        const field = allFields.findBy('name', `edit.${fieldName}`);
        set(field, 'defaultValue', value);
        if (!get(field, 'changed')) {
          this.set(`allFieldsValues.edit.${fieldName}`, value);
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
    return {
      monitorIp: this.get('allFieldsValues.edit.monitorIp') || undefined,
    };
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
