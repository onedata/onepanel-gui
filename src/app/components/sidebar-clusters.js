/**
 * A sidebar for clusters (extension of ``two-level-sidebar``)
 *
 * @module components/sidebar-clusters
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import TwoLevelSidebar from 'onepanel-gui/components/two-level-sidebar';
import layout from 'onepanel-gui/templates/components/two-level-sidebar';

const {
  computed: { readOnly },
  computed,
} = Ember;

export default TwoLevelSidebar.extend({
  layout,

  classNames: ['sidebar-clusters'],

  // TODO this will not work in generic multi-clusters menu  
  cluster: readOnly('model.collection.firstObject'),

  secondLevelItems: computed('onepanelServiceType', 'cluster.isInitialized', function () {
    let {
      onepanelServiceType,
      cluster,
    } = this.getProperties('onepanelServiceType', 'cluster');
    if (onepanelServiceType === 'provider' && cluster.get('isInitialized')) {
      // TODO i18n
      return [{
        id: 'spaces',
        label: 'Spaces',
      }];
    } else {
      return [];
    }
  }).readOnly(),
});
