import TwoLevelSidebar from 'onedata-web-frontend-2/components/two-level-sidebar';
import layout from 'onedata-web-frontend-2/templates/components/two-level-sidebar';

export default TwoLevelSidebar.extend({
  layout,

  classNames: ['sidebar-clusters'],

  newClusterRoute: null,
});
