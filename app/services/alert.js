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
 * Opens a simple alert modal using modal included in application template. 
 *
 * @module services/alert
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */
export default Ember.Service.extend({
  opened: false,
  type: null,
  text: null,

  info: aliasToShow('info'),
  success: aliasToShow('success'),
  warning: aliasToShow('warning'),
  error: aliasToShow('error'),

  show(type, text) {
    // TODO type is now ignored
    this.setProperties({ type, text, opened: true });
  },
});
