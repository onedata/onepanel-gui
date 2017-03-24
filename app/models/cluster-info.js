/**
 * Basic information about cluster needed to list them
 *
 * @module models/cluster-info
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

/**
 * @typedef {ClusterInfo}
 * @param {string} name
 * @param {number} initStep
 */
export default Ember.Object.extend({
  id: null,
  name: null
});
