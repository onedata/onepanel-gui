// import Ember from 'ember';

import TwoLevelSidebar from 'onepanel-gui/components/two-level-sidebar';
import layout from 'onepanel-gui/templates/components/two-level-sidebar';

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
