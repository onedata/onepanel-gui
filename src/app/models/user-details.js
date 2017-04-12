/**
 * FIXME
 *
 * @module models/user-details
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

const {
  computed: { alias },
} = Ember;

export default Ember.Object.extend({
  id: alias('username'),
  name: alias('username'),
  userId: null,
  userRole: null,
  username: null,
});
