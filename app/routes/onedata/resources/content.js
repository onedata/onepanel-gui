import Ember from 'ember';

const {
  inject: {
    service
  }
} = Ember;

export default Ember.Route.extend({
  sidebar: service(),

  model({ resourceId }) {
    // TODO: validate resourceType
    return {
      resourceId
    };
  },

  afterModel({ resourceId }) {
    let sidebar = this.get('sidebar');
    // TODO only if this is content with sidebar with item
    sidebar.changeItems(0, resourceId);
  },

  renderTemplate() {
    let {
      resourceType
    } = this.modelFor('onedata.resources');
    this.render('onedata.resources.content', {
      into: 'onedata',
      outlet: 'content'
    });
    this.render(`tabs.${resourceType}.content`, {
      into: 'onedata.resources.content',
      outlet: 'main-content'
    });
  }
});
