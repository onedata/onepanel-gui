/**
 * Definitions for XRootD fields of the cluster storage form.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import { TimeoutField } from './xrootd/timeout-field';
import { UrlField } from './xrootd/url-field';
import { ImportedDirectoryModeMaskField } from './xrootd/imported-directory-mode-mask-field';
import { ImportedFileModeMaskField } from './xrootd/imported-file-mode-mask-field';
import { CredentialsTypeField } from './xrootd/credentials-type-field';
import { CredentialsField } from './xrootd/credentials-field';

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
   * @virtual
   */
  fields: computed(function fields() {
    return [
      UrlField,
      ImportedFileModeMaskField,
      ImportedDirectoryModeMaskField,
      CredentialsTypeField,
      CredentialsField,
      TimeoutField,
    ].map((caveatsGroupClass) => caveatsGroupClass.create({
      context: this.context,
    }));
  }),

  isVisible: computed('context.component.basicGroup.value.type', function isVisible() {
    return this.context.component.basicGroup.value.type === 'xrootd';
  }),
});
