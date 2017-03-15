// import Ember from 'ember';

import TwoLevelSidebar from 'onepanel-web-frontend/components/two-level-sidebar';
import layout from 'onepanel-web-frontend/templates/components/two-level-sidebar';

// const {
//   computed
// } = Ember;

export default TwoLevelSidebar.extend({
  layout,

  classNames: ['sidebar-clusters'],

  newClusterRoute: null,

  actions: {
    changeResourceId() {
      this.sendAction('changeResourceId', ...arguments);
    }
  }
});
