import Ember from 'ember';

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
    let sessionValidation = this.get('sessionValidation');
    sessionValidation.catch(() => this.transitionTo('login'));
    return sessionValidation;
  },

  model() {
    let fakeMainMenuItems = A([
      'providers',
      'data',
      'promises',
      'spaces',
      'groups',
      'shares',
      'tokens',
      'clusters'
    ].map(id => ({
      id,
      // FIXME disabled true
      disabled: false
    })));

    fakeMainMenuItems.findBy('id', 'clusters').disabled = false;

    return new Promise((resolve) => {
      resolve(AppModel.create({
        mainMenuItems: fakeMainMenuItems
      }));
    });
  },

  actions: {
    mainMenuItemChanged(itemId) {
      this.transitionTo('onedata.sidebar', itemId);
    }
  }
});
