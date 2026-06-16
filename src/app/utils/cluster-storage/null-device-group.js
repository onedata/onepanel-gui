/**
 * Definitions for null device fields of the cluster storage form.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import { FilterField } from './null-device/filter-field';
import { SimulatedFilesystemGrowSpeedField } from './null-device/simulated-filesystem-grow-speed-field';
import { SimulatedFilesystemParametersField } from './null-device/simulated-filesystem-parameters-field';
import { LatencyMinField } from './null-device/latency-min-field';
import { LatencyMaxField } from './null-device/latency-max-field';
import { TimeoutProbabilityField } from './null-device/timeout-probability-field';
import { StorageFieldsGroup } from './base/storage-fields-group';

export const NullDeviceGroup = StorageFieldsGroup.extend({
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
    ].map((caveatsGroupClass) => caveatsGroupClass.create({
      context: this.context,
    }));
  }),
});
