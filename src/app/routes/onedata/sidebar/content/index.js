import Ember from 'ember';

// TODO copied from content route
const SPECIAL_IDS = [
  'empty',
  'new',
];

function isSpecialResourceId(id) {
  return SPECIAL_IDS.indexOf(id) !== -1;
}

export default Ember.Route.extend({
  model() {
    return this.modelFor('onedata.sidebar.content');
  },

  redirect({ resourceId }) {
    if (!isSpecialResourceId(resourceId)) {
      this.transitionTo('onedata.sidebar.content.aspect', 'index');
    }
  },

  renderTemplate(controller, model) {
    let { resourceType } = this.modelFor('onedata.sidebar');
    let { resourceId } = model;
    this.render(`tabs.${resourceType}.${resourceId}`, {
      into: 'onedata.sidebar.content',
      outlet: 'main-content'
    });
  }
});
