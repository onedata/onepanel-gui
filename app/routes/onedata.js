import Ember from 'ember';

import AppModel from 'onedata-web-frontend-2/utils/app-model';

const {
  Route,
  A,
  RSVP: {
    Promise
  }
} = Ember;

export default Route.extend({
  model() {
    return new Promise((resolve) => {
      resolve(AppModel.create({
        mainMenuItems: A([
          'providers',
          'data',
          'promises',
          'spaces',
          'groups',
          'shares',
          'tokens',
          'clusters'
        ].map(id => ({ id })))
      }));
    });
  },

  actions: {
    mainMenuItemChanged(itemId) {
      this.transitionTo('onedata.sidebar', itemId);
    }
  }
});
