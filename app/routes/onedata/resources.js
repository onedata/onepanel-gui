import Ember from 'ember';

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
  model({ resources }) {
    // TODO: validate resourceType
    let resourceType = SINGULARIZE_RESOURCE[resources];
    return {
      resourceType
    };
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
