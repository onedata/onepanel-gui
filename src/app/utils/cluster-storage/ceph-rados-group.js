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
import { BlockSizeField } from './common/block-size-field';
import { reads } from '@ember/object/computed';

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
    return this.type === 'cephrados' || this.type === 'ceph';
  }),
});
