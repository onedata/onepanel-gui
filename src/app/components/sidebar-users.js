/**
 * A sidebar for account settings
 *
 * @module components/sidebar-account
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

// TODO i18n

import Ember from 'ember';
import TwoLevelSidebar from 'onepanel-gui/components/two-level-sidebar';
import layout from 'onepanel-gui/templates/components/two-level-sidebar';

const {
  computed,
} = Ember;

export default TwoLevelSidebar.extend({
  layout,

  classNames: ['sidebar-account'],

  firstLevelItemIcon: 'user',

  secondLevelItems: computed(() => []).readOnly(),
});
