import Ember from 'ember';

export default Ember.Route.extend({
  model({ resourceId }) {
    // TODO: validate resourceType
    return {
      resourceId
    };
  },

  renderTemplate() {
    let {
      resourceType
    } = this.modelFor('onedata.resources');
    this.render('onedata.resources.content', {
      into: 'onedata',
      outlet: 'content'
    });
    this.render('onedata.resources.' + resourceType, {
      into: 'onedata.resources.content',
      outlet: 'main-content'
    });
  }
});
