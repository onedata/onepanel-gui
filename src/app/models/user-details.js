/**
 * A wrapper for Onepanel.UserDetails type
 *
 * Uses fields from UserDetails:
 * - userId
 * - username
 * - clusterPrivileges
 *
 * Adds:
 * - id: alias to username
 * - name: alias to username
 *
 * @module models/user-details
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject from '@ember/object';
import { alias } from '@ember/object/computed';

export default EmberObject.extend({
  /**
   * @virtual
   * @type {string}
   */
  userId: null,

  /**
   * @virtual
   * @type {string}
   */
  username: null,

  /**
   * @virtual
   * @type {Array<string>}
   */
  clusterPrivileges: null,

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  id: alias('userId'),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  name: alias('username'),
});
