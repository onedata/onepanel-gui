/**
 * A route to view or modify a specific aspect of a resource
 *
 * @module routes/onedata/sidebar/content/option
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

const {
  inject: {
    service
  },
} = Ember;

export default Ember.Route.extend({
  sidebar: service(),

  model({ aspectId }) {
    let { resource } = this.modelFor('onedata.sidebar.content');
    return { resource, aspectId };
  },

  // TODO validate aspect of resource with afterModel
  afterModel({ aspectId }) {
    let sidebar = this.get('sidebar');
    sidebar.changeItems(1, aspectId);
  },

  renderTemplate(controller, model) {
    let { resourceType } = this.modelFor('onedata.sidebar');
    let { aspectId } = model;
    this.render(`tabs.${resourceType}.${aspectId}`, {
      into: 'onedata.sidebar.content',
      outlet: 'main-content'
    });
  },

});
