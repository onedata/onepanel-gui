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

export default Ember.Route.extend({
  mainMenu: service(),
  sidebar: service(),
  sidebarResources: service(),

  model({ resources }) {
    // TODO: validate reource type
    let sidebarResources = this.get('sidebarResources');
    // let resourceType = SINGULARIZE_RESOURCE[resources];
    return new Promise((resolve, reject) => {
      let gettingModel = sidebarResources.getModelFor(resources);
      gettingModel.then(collection => {
        resolve({
          resourceType: resources,
          collection
        });
      });
      gettingModel.catch(reject);
    });
  },

  afterModel({ resourceType }) {
    let mainMenu = this.get('mainMenu');
    mainMenu.currentItemIdChanged(resourceType);
  },

  renderTemplate(controller, model) {
    let {
      resourceType
    } = model;
    this.render('onedata.resources', {
      into: 'onedata',
      outlet: 'sidebar'
    });
    this.render(`tabs.${resourceType}.sidebar`, {
      into: 'onedata.resources',
      outlet: 'sidebar-content',
      model
    });
  },

  actions: {
    changeResourceId(resourceType, itemId) {      
      this.transitionTo('onedata.resources.content', resourceType, itemId);
      
      // TODO: a loader for clicked sidebar item can be done here by usin transition as a promise
    }
  }
});
