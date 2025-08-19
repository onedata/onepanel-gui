/**
 * Definitions for ceph rados fields of the cluster storage form.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import { KeyField } from './ceph-rados/key-field';
import { UsernameField } from './ceph-rados/username-field';
import { MonitorHostnameField } from './ceph-rados/monitor-hostname-field';
import { ClusterNameField } from './ceph-rados/cluster-name-field';
import { PoolNameField } from './ceph-rados/pool-name-field';
import { TimeoutField } from './common/timeout-field';
import { BlockSizeField } from './common/block-size-field';

export const CephRadosGroup = FormFieldsGroup.extend({
  /**
   * @virtual
   */
  context: undefined,

  /**
   * @override
   */
  name: 'cephrados',

  /**
   * @virtual
   */
  fields: computed(function fields() {
    return [
      UsernameField,
      KeyField,
      MonitorHostnameField,
      ClusterNameField,
      PoolNameField,
      BlockSizeField,
      TimeoutField,
    ].map((caveatsGroupClass) => caveatsGroupClass.create({
      context: this.context,
    }));
  }),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isVisible: computed('context.component.basicGroup.value.type', function isVisible() {
    return this.context.component.basicGroup.value.type === 'cephrados';
  }),
});
