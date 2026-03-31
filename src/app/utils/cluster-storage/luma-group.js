/**
 * Definitions for external luma fields of the cluster storage form.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import { ApiKeyField } from './basic/luma/api-key-field';
import { UrlField } from './basic/luma/url-field';

export const LumaGroup = FormFieldsGroup.extend({
  /**
   * @virtual
   */
  context: undefined,

  /**
   * @override
   */
  name: 'luma',

  /**
   * @override
   */
  fields: computed(function fields() {
    return [
      UrlField,
      ApiKeyField,
    ].map((caveatsGroupClass) => caveatsGroupClass.create({
      context: this.context,
    }));
  }),

  /**
   * @type {ComputedProperty<SafeString>}
   */
  title: computed(function title() {
    return this.t('sectionTitle');
  }),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isVisible: computed('context.component.basicGroup.value.lumaFeed', function isVisible() {
    return this.context.component.basicGroup.value.lumaFeed === 'external';
  }),
});
