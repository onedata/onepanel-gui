import Ember from 'ember';

const {
  inject: {
    service
  },
  RSVP: {
    Promise
  }
} = Ember;

const SPECIAL_IDS = [
  'empty',
  'new'
];

function isSpecialResourceId(id) {
  return SPECIAL_IDS.indexOf(id) !== -1;
}

export default Ember.Route.extend({
  sidebar: service(),
  eventsBus: service(),

  model({
    resourceId
  }) {
    // TODO: validate and use resourceType
    let {
      resourceType
    } = this.modelFor('onedata.sidebar');

    if (isSpecialResourceId(resourceId)) {
      return {
        resourceId
      };
    } else {
      return new Promise((resolve) => {
        resolve({
          id: resourceId,
          name: `Some fake ${resourceType} ${resourceId}`
        });
      });
    }
  },

  afterModel({
    resourceId
  }) {
    let sidebar = this.get('sidebar');
    // TODO only if this is content with sidebar with item
    sidebar.changeItems(0, resourceId);
    // TODO get properties
    // TODO transition promise wait before hide sidenav
    this.get('eventsBus').trigger('one-sidenav:close', '#sidenav-sidebar');
  },

  renderTemplate(controller, model) {
    let {
      resourceType
    } = this.modelFor('onedata.sidebar');
    let {
      resourceId
    } = model;
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
