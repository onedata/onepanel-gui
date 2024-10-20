/**
 * A form for gathering and showing data about space support accounting
 * configuration.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, observer, get, getProperties, set } from '@ember/object';
import { reads } from '@ember/object/computed';
import { scheduleOnce } from '@ember/runloop';
import { tag, not, conditional, raw } from 'ember-awesome-macros';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import ToggleField from 'onedata-gui-common/utils/form-component/toggle-field';
import I18n from 'onedata-gui-common/mixins/i18n';
import { createValuesContainer } from 'onedata-gui-common/utils/form-component/values-container';

/**
 * @typedef {Object} SpaceSupportAccountingFormValues
 * @property {boolean} accountingEnabled
 * @property {boolean} dirStatsServiceEnabled
 */

export default Component.extend(I18n, {
  classNames: ['space-support-accounting-form'],

  /**
   * @override
   */
  i18nPrefix: 'components.spaceSupportAccountingForm',

  /**
   * @virtual optional
   * @type {boolean}
   */
  isDisabled: false,

  /**
   * @virtual optional
   * @type {'view'|'edit'}
   */
  mode: 'edit',

  /**
   * @virtual optional
   * @type {SpaceSupportAccountingFormValues}
   */
  values: undefined,

  /**
   * @virtual optional
   * @type {(values: SpaceSupportAccountingFormValues) => void}
   */
  onChange: undefined,

  /**
   * @virtual optional
   * @type {DirStatsServiceStatus}
   */
  dirStatsServiceStatus: undefined,

  /**
   * @type {FormComponent.ValuesContainer}
   */
  normalizedValues: computed('values', function normalizedValues() {
    return createValuesContainer({
      accountingEnabled: this.values ? Boolean(this.values.accountingEnabled) : false,
      dirStatsServiceEnabled: this.values ?
        Boolean(this.values.dirStatsServiceEnabled) : true,
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsRootGroup>}
   */
  fieldsRootGroup: computed(function fieldsRootGroup() {
    return FieldsRootGroup.create({ component: this });
  }),

  modeObserver: observer('mode', function modeObserver() {
    this.applyFormMode();
  }),

  normalizedValuesObserver: observer(
    'normalizedValues',
    function normalizedValuesObserver() {
      this.applyFormValues();
    }
  ),

  /**
   * @override
   */
  init() {
    this._super(...arguments);
    this.setupForm();
  },

  /**
   * @override
   */
  willDestroyElement() {
    this._super(...arguments);
    this.get('fieldsRootGroup').destroy();
  },

  setupForm() {
    this.applyFormMode(true);
    this.applyFormValues(true);
  },

  applyFormMode(force = false) {
    const {
      fieldsRootGroup,
      mode,
    } = this.getProperties('fieldsRootGroup', 'mode');

    if (get(fieldsRootGroup, 'mode') !== mode || force) {
      fieldsRootGroup.changeMode(mode);
      this.resetForm();
    }
  },

  applyFormValues(force = false) {
    if (this.get('mode') === 'view' || force) {
      this.resetForm(force);
    }
  },

  resetForm(forceValuesReload = false) {
    const {
      fieldsRootGroup,
      mode,
      normalizedValues,
    } = this.getProperties('fieldsRootGroup', 'mode', 'normalizedValues');

    if (mode === 'view' || forceValuesReload) {
      set(fieldsRootGroup, 'valuesSource', normalizedValues);
      fieldsRootGroup.useCurrentValueAsDefault();
    }
    fieldsRootGroup.reset();
  },

  notifyAboutChange() {
    const {
      onChange,
      fieldsRootGroup,
      mode,
    } = this.getProperties('onChange', 'fieldsRootGroup', 'mode');

    if (mode === 'view' || !onChange) {
      return;
    }

    const dumpedValues = getProperties(
      fieldsRootGroup.dumpValue(),
      'accountingEnabled',
      'dirStatsServiceEnabled',
    );

    onChange(dumpedValues);
  },
});

const FieldsRootGroup = FormFieldsRootGroup.extend({
  classes: 'accounting-fields-root-group',
  i18nPrefix: tag`${'component.i18nPrefix'}.fields`,
  ownerSource: reads('component'),
  isEnabled: not('component.isDisabled'),
  fields: computed(function fields() {
    return [
      AccountingEnabledToggle.create(),
      DirStatsServiceEnabledToggle.create(),
    ];
  }),
  onValueChange(value, field) {
    this._super(...arguments);

    // When accounting becomes enabled, then dir stats should also be enabled
    if (
      get(field, 'name') === 'accountingEnabled' &&
      value &&
      !this.get('valuesSource.dirStatsServiceEnabled')
    ) {
      this.getFieldByPath('dirStatsServiceEnabled').valueChanged(true);
    }

    scheduleOnce('afterRender', this.get('component'), 'notifyAboutChange');
  },
});

const AccountingEnabledToggle = ToggleField.extend({
  name: 'accountingEnabled',
});

const DirStatsServiceEnabledToggle = ToggleField.extend({
  name: 'dirStatsServiceEnabled',
  isEnabled: not('valuesSource.accountingEnabled'),
  disabledControlTip: computed(
    'valuesSource.accountingEnabled',
    function disabledControlTip() {
      if (this.get('valuesSource.accountingEnabled')) {
        return this.getTranslation('disabledDueToAccountingTip');
      }
    }
  ),
  afterComponentName: conditional(
    'isInViewMode',
    raw('space-support-accounting-form/status-badge'),
    raw(undefined),
  ),
  dirStatsServiceStatus: reads('parent.component.dirStatsServiceStatus'),
});
