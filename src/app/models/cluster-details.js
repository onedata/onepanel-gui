/**
 * A complete model for Cluster entity used in panel
 *
 * A `ClusterInfo` object should be referenced to provide basic information
 * about cluster.
 *
 * @module models/cluster-details
 * @author Jakub Liput
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import ObjectProxy from '@ember/object/proxy';
import { computed } from '@ember/object';
import { alias, reads } from '@ember/object/computed';

export const CLUSTER_INIT_STEPS = Object.freeze({
  DEPLOY: 0,
  // pseudo-step: should be always between DEPLOY and DEPLOY + 1
  DEPLOYMENT_PROGRESS: 0.5,
  ZONE_DEPLOY: 0,
  ZONE_IPS: 1,
  ZONE_DNS: 2,
  ZONE_WEB_CERT: 3,
  ZONE_DONE: 4,
  PROVIDER_DEPLOY: 0,
  PROVIDER_REGISTER: 1,
  PROVIDER_IPS: 2,
  PROVIDER_DNS: 3,
  PROVIDER_WEB_CERT: 4,
  PROVIDER_STORAGE_ADD: 5,
  PROVIDER_DONE: 6,
});

export default ObjectProxy.extend({
  content: alias('clusterInfo'),

  /**
   * @type {string}
   */
  onepanelServiceType: null,

  /**
   * To inject.
   * @type {ClusterInfo}
   */
  clusterInfo: null,

  initStep: CLUSTER_INIT_STEPS.DEPLOY,

  /**
   * @type {string|null}
   */
  name: null,

  type: reads('content.onepanelServiceType'),

  init() {
    this._super(...arguments);
    // TODO i18n or set default name in some view
    if (this.get('name') == null) {
      this.set('name', 'New cluster');
    }
  },

  isInitialized: computed('initStep', 'onepanelServiceType', function () {
    let {
      initStep,
      onepanelServiceType,
    } = this.getProperties('initStep', 'onepanelServiceType');
    return onepanelServiceType === 'oneprovider' ?
      initStep >= CLUSTER_INIT_STEPS.PROVIDER_DONE :
      initStep >= CLUSTER_INIT_STEPS.ZONE_DONE;
  }),
});
