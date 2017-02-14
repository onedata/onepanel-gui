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
        {
          id: 1,
          label: 'jeden'
        },
        {
          id: 2,
          label: 'dwa'
        },
        {
          id: 3,
          label: 'jeden-cztery'
        },
        {
          id: 4,
          label: 'cztery'
        },
      ],
      buttons: [
        {
          title: 'create something',
          icon: 'create',
          action: 'create'
        },
        {
          title: 'remove all',
          icon: 'clear',
          action: 'clear'
        },
      ]
    };
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
