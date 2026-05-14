/**
 * Definitions for base fields group of the cluster storage form.
 *
 * @author Agnieszka Raczek
 * @copyright (C) 2026 Onedata (onedata.org)
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import { reads } from '@ember/object/computed';

export const StorageFieldsGroup = FormFieldsGroup.extend({
  /**
   * @virtual
   */
  context: undefined,

  /**
   * @type {ComputedProperty<string>}
   */
  selectedType: reads('context.component.basicGroup.value.type'),

  /**
   * @type {ComputedProperty<SafeString>}
   */
  title: computed('selectedType', function title() {
    return this.t('sectionTitle', {
      type: this.t(`basic.type.options.${this.selectedType}.label`),
    });
  }),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isVisible: computed('selectedType', 'name', function isVisible() {
    return this.selectedType === this.name;
  }),
});
