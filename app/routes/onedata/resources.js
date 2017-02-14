import Ember from 'ember';

const {
  inject: {
    service
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

  model({ resources }) {
    // TODO: validate resourceType
    let resourceType = SINGULARIZE_RESOURCE[resources];
    return {
      resourceType,
      collection: [
        1,
        2,
        3
      ]
    };
  },

  afterModel({ resourceType }) {
    let mainMenu = this.get('mainMenu');
    mainMenu.currentItemChanged(resourceType);
  },

  renderTemplate(controller, { resourceType }) {
    this.render('onedata.resources', {
      into: 'onedata',
      outlet: 'sidebar'
    });
    this.render('onedata.' + PLURALIZE_RESOURCE[resourceType], {
      into: 'onedata.resources',
      outlet: 'sidebar-content'
    });
  }
});
