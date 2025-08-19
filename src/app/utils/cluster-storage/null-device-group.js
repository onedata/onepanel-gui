/**
 * Definitions for null device fields of the cluster storage form.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import { TimeoutField } from './common/timeout-field';
import { FilterField } from './null-device/filter-field';
import { SimulatedFilesystemGrowSpeedField } from './null-device/simulated-filesystem-grow-speed-field';
import { SimulatedFilesystemParametersField } from './null-device/simulated-filesystem-parameters-field';
import { LatencyMinField } from './null-device/latency-min-field';
import { LatencyMaxField } from './null-device/latency-max-field';
import { TimeoutProbabilityField } from './null-device/timeout-probability-field';

export const NullDeviceGroup = FormFieldsGroup.extend({
  /**
   * @virtual
   */
  context: undefined,

  /**
   * @override
   */
  name: 'nulldevice',

  /**
   * @override
   */
  fields: computed(function fields() {
    return [
      LatencyMinField,
      LatencyMaxField,
      TimeoutProbabilityField,
      FilterField,
      SimulatedFilesystemParametersField,
      SimulatedFilesystemGrowSpeedField,
      TimeoutField,
    ].map((caveatsGroupClass) => caveatsGroupClass.create({
      context: this.context,
    }));
  }),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isVisible: computed('context.component.basicGroup.value.type', function isVisible() {
    return this.context.component.basicGroup.value.type === 'nulldevice';
  }),
});
