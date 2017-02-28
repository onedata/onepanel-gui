import Ember from 'ember';

const {
  inject: {
    service
  },
  RSVP: {
    Promise
  }
} = Ember;

// TODO conside use of "empty" route instead of special "new" - all routes should have this
const SPECIAL_IDS = [
  'new'
];

function isSpecialResourceId(id) {
  return SPECIAL_IDS.indexOf(id) !== -1;
}

export default Ember.Route.extend({
  sidebar: service(),

  model({ resourceId }) {
    // TODO: validate and use resourceType
    let { resourceType } = this.modelFor('onedata.sidebar');

    if (isSpecialResourceId(resourceId)) {
      return { resourceId };
    } else {
      return new Promise((resolve) => {
        resolve({
          id: resourceId,
          name: `Some fake ${resourceType} ${resourceId}`
        });
      });
    }
  },

  afterModel({ resourceId }) {
    let sidebar = this.get('sidebar');
    // TODO only if this is content with sidebar with item
    sidebar.changeItems(0, resourceId);
  },

  renderTemplate(controller, model) {
    let { resourceType } = this.modelFor('onedata.sidebar');
    let { resourceId } = model;
    // render generic content template
    this.render('onedata.sidebar.content', {
      into: 'onedata',
      outlet: 'content'
    });
    // then render specific content into generic content template
    let specificContent = isSpecialResourceId(resourceId) ? resourceId : 'content';
    this.render(`tabs.${resourceType}.${specificContent}`, {
      into: 'onedata.sidebar.content',
      outlet: 'main-content'
    });
  },
});
