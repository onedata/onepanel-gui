/**
 * Shows information about conflicting ports of different kind of services
 * attached to the same host.
 *
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @copyright (C) 2025 Onedata (onedata.org)
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/i18n';

export default Component.extend(I18n, {
  tagName: '',

  i18n: service(),
  deploymentManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.conflictingPortsInfo',

  /**
   * @virtual
   * @type {Array<Models.ClusterHostInfo>}
   */
  hosts: undefined,

  /** @type {ComputedProperty<number>} */
  oneS3Port: reads(
    'deploymentManager.installationDetailsProxy.content.cluster.oneS3.port'
  ),

  /**
   * @type {ComputedProperty<Array<Models.ClusterHostInfo>>}
   */
  isSomePortConflicting: computed(
    'oneS3Port',
    'hosts.@each.{clusterWorker,oneS3}',
    function hostsWithConflictedOneS3() {
      return this.oneS3Port === 443 &&
        this.hosts?.some((host) => host.clusterWorker && host.oneS3);
    }
  ),

  /**
   * @type {ComputedProperty<SafeString | null>}
   */
  textToShow: computed('isSomePortConflicting', function textToShow() {
    if (this.isSomePortConflicting) {
      return this.t('conflictingOneS3Info');
    }
    return null;
  }),
});
