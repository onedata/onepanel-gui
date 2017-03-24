/**
 * Should be presented when no cluster has started a deployment
 *
 * @module components/empty-collection-content-clusters
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import ContentInfo from 'onepanel-gui/components/content-info';
import layout from 'onepanel-gui/templates/components/content-info';

// TODO: i18n
export default ContentInfo.extend({
  layout,

  header: 'welcome',
  subheader: 'to onepanel of provider',
  text: 'You had not deployed any cluster yet.',
  buttonLabel: 'Create new cluster',

  buttonAction() {
    this.sendAction('transitionTo', 'onedata.sidebar.content', 'clusters', 'new');
  }
});
