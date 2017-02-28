import Ember from 'ember';

const {
  inject: {
    service
  },
  RSVP: {
    Promise
  }
} = Ember;

// TODO better implementation
const SINGULARIZE_RESOURCE = {
  providers: 'provider',
  spaces: 'space'
};

const PLURALIZE_RESOURCE = {
  provider: 'providers',
  space: 'spaces'
};

// TODO: maybe separate util (maybe from GUI16) and jsdoc
function getDefaultResource(collection) {
  return collection.objectAt(0);
}

export default Ember.Route.extend({
  mainMenu: service(),
  sidebar: service(),
  sidebarResources: service(),

  model({ type }) {
    // TODO: validate reource type
    let sidebarResources = this.get('sidebarResources');
    return new Promise((resolve, reject) => {
      let gettingModel = sidebarResources.getModelFor(type);
      gettingModel.then(collection => {
        resolve({
          resourceType: type,
          collection
        });
      });
      gettingModel.catch(reject);
    });
  },

  afterModel(model) {
    let { resourceType } = model;
    let mainMenu = this.get('mainMenu');
    mainMenu.currentItemIdChanged(resourceType);
  },

  renderTemplate(controller, model) {
    let {
      resourceType
    } = model;
    this.render('onedata.sidebar', {
      into: 'onedata',
      outlet: 'sidebar'
    });
    this.render(`tabs.${resourceType}.sidebar`, {
      into: 'onedata.sidebar',
      outlet: 'sidebar-content',
      model
    });
  },

  actions: {
    changeResourceId(resourceType, itemId) {      
      this.transitionTo('onedata.sidebar.content', resourceType, itemId);
      
      // TODO: a loader for clicked sidebar item can be done here by usin transition as a promise
    }
  }
});
