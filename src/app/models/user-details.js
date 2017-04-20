/**
 * A wrapper for Onepanel.UserDetails type
 *
 * Uses fields from UserDetails:
 * - userId
 * - userRole
 * - username
 *
 * Adds:
 * - id: alias to username
 * - name: alias to username
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
