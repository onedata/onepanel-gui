import Ember from 'ember';

const {
  inject: {
    service
  }
} = Ember;

function aliasToShow(type) {
  return function (message, options) {
    return this.show(type, message, options);
  };
}

/**
 * Exposes methods for reporting various asyc notifications to user.
 *
 * It is used to report:
 * - success in operation
 * - fatal error in operation (esp. for backend operations)
 * - ...and more planned
 *
 * @module services/global-notify
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */
export default Ember.Service.extend({
  notify: service(),
  alert: service(),

  info: aliasToShow('info'),
  success: aliasToShow('success'),
  warning: aliasToShow('warning'),
  error: aliasToShow('error'),

  /**
   * Main method for reporting some information to user
   * @param {string} type one of: error, info
   */
  show(type, message) {
    switch (type) {
    case 'error':
      console.error('global-notify: Error reported: ' + message);
      this.get('alert').show(type, message);
      break;
    case 'warning':
    case 'info':
    case 'success':
      this.get('notify').show(type, message);
      break;
    default:
      break;
    }
  },
});
