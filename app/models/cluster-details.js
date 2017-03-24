/**
 * A complete model for Cluster entity used in panel
 *
 * A ``ClusterInfo`` object should be referenced to provide basic information
 * about cluster.
 *
 * @module models/cluster-details
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

const {
  computed: {
    alias,
  },
} = Ember;

export default Ember.ObjectProxy.extend({
  content: alias('clusterInfo'),

  /**
   * To inject.
   * @type {ClusterInfo}
   */
  clusterInfo: null,

  initStep: 0,
});
