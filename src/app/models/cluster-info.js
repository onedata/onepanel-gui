/**
 * Basic information about cluster needed to list them
 *
 * @author Jakub Liput
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
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
