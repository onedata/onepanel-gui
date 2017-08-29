/**
 * Authenticated main view index (without any specific route)
 *
 * @module routes/onedata/index
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

const {
  Route,
  get,
} = Ember;

export default Route.extend(AuthenticatedRouteMixin, {
  model() {
    return this.modelFor('onedata');
  },

  afterModel(model) {
    let mainMenuItems = get(model, 'mainMenuItems');
    let firstItem = mainMenuItems[0];
    if (mainMenuItems) {
      let firstItemId = get(firstItem, 'id');
      this.controllerFor('onedata').send('mainMenuItemChanged', firstItemId);
    } else {
      console.error('routes:index: empty collection of main menu items');
    }
  },
});
