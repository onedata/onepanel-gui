/**
 * Range write support field of the storage.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { StorageRadioField } from '../base/storage-radio-field';
import { computed } from '@ember/object';
import { observer } from '@ember/object';
import { reads } from '@ember/object/computed';

export const RangeWriteSupportField = StorageRadioField.extend({
  /**
   * @override
   */
  name: 'rangeWriteSupport',

  autoSettingValue: undefined,

  /**
   * @override
   */
  options: Object.freeze([
    { value: 'none' },
    { value: 'sabredav' },
    { value: 'moddav' },
  ]),
});
