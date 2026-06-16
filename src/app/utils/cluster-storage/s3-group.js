/**
 * Definitions for S3 fields of the cluster storage form.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @copyright (C) 2026 Onedata (onedata.org)
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import { HostnameField } from './s3/hostname-field';
import { RegionField } from './s3/region-field';
import { S3BlockSizeField } from './s3/block-size-field';
import { FileModeField } from './s3/file-mode-field';
import { DirModeField } from './s3/dir-mode-field';
import { BucketNameField } from './s3/bucket-name-field';
import { VerifyServerCertificateField } from './common/verify-server-certificate-field';
import { AccessKeyField } from './s3/access-key-field';
import { SecretKeyField } from './s3/secret-key-field';
import { StorageFieldsGroup } from './base/storage-fields-group';

export const S3Group = StorageFieldsGroup.extend({
  /**
   * @override
   */
  name: 's3',

  /**
   * @override
   */
  fields: computed(function fields() {
    return [
      HostnameField,
      BucketNameField,
      VerifyServerCertificateField,
      RegionField,
      AccessKeyField,
      SecretKeyField,
      S3BlockSizeField,
      FileModeField,
      DirModeField,
    ].map((caveatsGroupClass) => caveatsGroupClass.create({
      context: this.context,
    }));
  }),
});
