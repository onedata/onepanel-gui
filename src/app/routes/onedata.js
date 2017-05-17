/**
 * A parent for all routes for authenticated user
 *
 * @module routes/onedata
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import AppModel from 'onepanel-gui/utils/app-model';
import config from 'ember-get-config';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

const {
  Route,
  A,
  RSVP: { Promise },
} = Ember;

const {
  onedataTabs
} = config;

export default Route.extend(AuthenticatedRouteMixin, {
  model() {
    let mainMenuItems = A(onedataTabs).map(id => ({
      id,
      disabled: false
    }));

    return new Promise((resolve) => {
      resolve(AppModel.create({ mainMenuItems }));
    });
  },
});
