/**
 * Definitions for S3 fields of the cluster storage form.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @copyright (C) 2026 Onedata (onedata.org)
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import { HostnameField } from './s3/hostname-field';
import { RegionField } from './s3/region-field';
import { S3BlockSizeField } from './s3/block-size-field';
import { FileModeField } from './s3/file-mode-field';
import { DirModeField } from './s3/dir-mode-field';
import { TimeoutField } from './common/timeout-field';
import { BucketNameField } from './s3/bucket-name-field';
import { VerifyServerCertificateField } from './common/verify-server-certificate-field';
import { AccessKeyField } from './s3/access-key-field';
import { SecretKeyField } from './s3/secret-key-field';

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
      TimeoutField,
    ].map((caveatsGroupClass) => caveatsGroupClass.create({
      context: this.context,
    }));
  }),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isVisible: computed('context.component.basicGroup.value.type', function isVisible() {
    return this.context.component.basicGroup.value.type === 's3';
  }),
});
