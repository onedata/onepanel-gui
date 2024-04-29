/**
 * Shows information about conflicting ports of different kind of services
 * attached to the same host.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/i18n';

export default Component.extend(I18n, {
  tagName: '',

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.conflictingPortsInfo',

  /**
   * @virtual
   * @type {Array<Models.ClusterHostInfo>}
   */
  hosts: undefined,

  /**
   * @type {ComputedProperty<Array<Models.ClusterHostInfo>>}
   */
  hostsWithConflictedOneS3: computed(
    'hosts.@each.{clusterWorker,oneS3}',
    function hostsWithConflictedOneS3() {
      return this.hosts.filter((host) => host.clusterWorker && host.oneS3);
    }
  ),

  /**
   * @type {ComputedProperty<SafeString | null>}
   */
  textToShow: computed('hostsWithConflictedOneS3', function textToShow() {
    if (this.hostsWithConflictedOneS3.length) {
      return this.t('conflictingOneS3Info');
    }
    return null;
  }),
});
