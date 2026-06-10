/**
 * Definitions for ceph rados fields of the cluster storage form.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import { KeyField } from './ceph-rados/key-field';
import { UsernameField } from './ceph-rados/username-field';
import { MonitorHostnameField } from './ceph-rados/monitor-hostname-field';
import { ClusterNameField } from './ceph-rados/cluster-name-field';
import { PoolNameField } from './ceph-rados/pool-name-field';
import { BlockSizeField } from './common/block-size-field';
import { StorageFieldsGroup } from './base/storage-fields-group';

export const CephRadosGroup = StorageFieldsGroup.extend({
  /**
   * @override
   */
  name: 'cephrados',

  /**
   * @override
   */
  fields: computed(function fields() {
    return [
      UsernameField,
      KeyField,
      MonitorHostnameField,
      ClusterNameField,
      PoolNameField,
      BlockSizeField,
    ].map((caveatsGroupClass) => caveatsGroupClass.create({
      context: this.context,
    }));
  }),

  /**
   * @override
   * @type {Ember.ComputedProperty<boolean>}
   */
  isVisible: computed('selectedType', function isVisible() {
    return this.selectedType === 'cephrados' || this.selectedType === 'ceph';
  }),
});
