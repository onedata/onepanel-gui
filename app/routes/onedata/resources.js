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
  sidebarResources: service(),

  model({ resources }) {
    // TODO: validate reource type
    let sidebarResources = this.get('sidebarResources');
    let resourceType = SINGULARIZE_RESOURCE[resources];
    return new Promise((resolve, reject) => {
      let gettingModel = sidebarResources.getModelFor(resources);
      gettingModel.then(collection => {
        resolve({
          resourceType,
          collection
        });
      });
      gettingModel.catch(reject);
    });
  },

  afterModel({ resourceType }) {
    let mainMenu = this.get('mainMenu');
    mainMenu.currentItemChanged(resourceType);
  },

  renderTemplate(controller, { resourceType, collection }) {
    this.render('onedata.resources', {
      into: 'onedata',
      outlet: 'sidebar'
    });
    this.render('onedata.' + PLURALIZE_RESOURCE[resourceType], {
      into: 'onedata.resources',
      outlet: 'sidebar-content',
      model: collection
    });
  }
});
