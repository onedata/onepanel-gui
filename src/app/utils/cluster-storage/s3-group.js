/**
 * Definitions for S3 fields of the cluster storage form.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import { ArchiveStorageField } from './s3/archive-storage-field';
import { EndpointUrlField } from './s3/endpoint-url-field';
import { RegionField } from './s3/region-field';
import { BlockSizeField } from './s3/block-size-field';
import { MaximumCanonicalObjectSizeField } from './s3/maximum-canonical-object-size-field';
import { ImportedFileModeField } from './s3/imported-file-mode-field';
import { ImportedDirectoryModeField } from './s3/imported-directory-mode-field';
import { TimeoutField } from './s3/timeout-field';
import { BucketNameField } from './s3/bucket-name-field';
import { VerifyServerCertField } from './s3/verify-server-cert-field';
import { AdminAccessKeyField } from './s3/admin-access-key-field';
import { AdminSecretKeyField } from './s3/admin-secret-key-field';

export const S3Group = FormFieldsGroup.extend({
  /**
   * @virtual
   */
  context: undefined,

  /**
   * @override
   */
  name: 's3',

  /**
   * @virtual
   */
  fields: computed(function fields() {
    return [
      ArchiveStorageField,
      EndpointUrlField,
      BucketNameField,
      VerifyServerCertField,
      RegionField,
      AdminAccessKeyField,
      AdminSecretKeyField,
      BlockSizeField,
      MaximumCanonicalObjectSizeField,
      ImportedFileModeField,
      ImportedDirectoryModeField,
      TimeoutField,
    ].map((caveatsGroupClass) => caveatsGroupClass.create({
      context: this.context,
    }));
  }),

  isVisible: computed('context.component.basicGroup.value.type', function isVisible() {
    return this.context.component.basicGroup.value.type === 's3';
  }),
});
