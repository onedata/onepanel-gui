// import Ember from 'ember';

import TwoLevelSidebar from 'onedata-web-frontend-2/components/two-level-sidebar';
import layout from 'onedata-web-frontend-2/templates/components/two-level-sidebar';

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
