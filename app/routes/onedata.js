import Ember from 'ember';
import { invoke } from 'ember-invoke-action';

import AppModel from 'onepanel-web-frontend/utils/app-model';

const {
  Route,
  A,
  RSVP: {
    Promise
  },
  inject: {
    service
  },
  computed: {
    readOnly
  }
} = Ember;

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
    let fakeMainMenuItems = A([
      // 'providers',
      // 'data',
      // 'promises',
      // 'spaces',
      // 'groups',
      // 'shares',
      // 'tokens',
      'clusters'
    ]).map(id => ({
      id,
      // FIXME disabled true
      disabled: false
    }));

    fakeMainMenuItems.findBy('id', 'clusters').disabled = false;

    return new Promise((resolve) => {
      resolve(AppModel.create({
        mainMenuItems: fakeMainMenuItems
      }));
    });
  },

  afterModel(model) {
    let firstItemId = model.get('mainMenuItems.firstObject').id;
    invoke(this, 'mainMenuItemChanged', firstItemId);
  },

  actions: {
    mainMenuItemChanged(itemId) {
      this.transitionTo('onedata.sidebar', itemId);
    }
  }
});
