/**
 * Definitions for XRootD fields of the cluster storage form.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import { UrlField } from './xrootd/url-field';
import { ImportedDirectoryModeMaskField } from './xrootd/imported-directory-mode-mask-field';
import { ImportedFileModeMaskField } from './xrootd/imported-file-mode-mask-field';
import { CredentialsTypeField } from './xrootd/credentials-type-field';
import { UsernameField } from './xrootd/username-field';
import { PasswordField } from './xrootd/password-field';
import { reads } from '@ember/object/computed';

export const XrootdGroup = FormFieldsGroup.extend({
  /**
   * @virtual
   */
  context: undefined,

  /**
   * @override
   */
  name: 'xrootd',

  /**
   * @override
   */
  fields: computed(function fields() {
    return [
      UrlField,
      ImportedFileModeMaskField,
      ImportedDirectoryModeMaskField,
      CredentialsTypeField,
      UsernameField,
      PasswordField,
    ].map((caveatsGroupClass) => caveatsGroupClass.create({
      context: this.context,
    }));
  }),

  /**
   * @type {ComputedProperty<string>}
   */
  type: reads('context.component.basicGroup.value.type'),

  /**
   * @type {ComputedProperty<SafeString>}
   */
  title: computed('type', function title() {
    return this.t('sectionTitle', {
      type: this.t(`basic.type.options.${this.type}.label`),
    });
  }),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isVisible: computed('type', function isVisible() {
    return this.type === 'xrootd';
  }),
});
