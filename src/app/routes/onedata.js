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

const {
  Route,
  A,
  RSVP: { Promise },
  inject: { service },
  computed: { readOnly },
} = Ember;

const {
  onedataTabs
} = config;

export default Route.extend({
  onepanelServer: service(),

  sessionValidation: readOnly('onepanelServer.sessionValidator.promise'),

  beforeModel() {
    let onepanelServer = this.get('onepanelServer');
    let serverIsInitialized = onepanelServer.get('isInitialized');
    if (!serverIsInitialized) {
      let sessionValidation = this.get('sessionValidation');
      sessionValidation.catch(() => this.transitionTo('login'));
      return sessionValidation;
    } else {
      return undefined;
    }
  },

  model() {
    let mainMenuItems = A(onedataTabs).map(item => Object.assign({}, item, { disabled: false }));

    return new Promise((resolve) => {
      resolve(AppModel.create({ mainMenuItems }));
    });
  },

  afterModel(model) {
    let firstItemId = model.get('mainMenuItems.firstObject').id;
    this.controllerFor('onedata').send('mainMenuItemChanged', firstItemId);
  },
});
