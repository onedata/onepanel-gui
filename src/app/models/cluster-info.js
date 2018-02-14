/**
 * Basic information about cluster needed to list them
 *
 * @module models/cluster-info
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject from '@ember/object';

/**
 * @typedef {ClusterInfo}
 * @param {string} name
 * @param {number} initStep
 */
export default EmberObject.extend({
  id: null,
  name: null,
});
