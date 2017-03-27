/**
 * Should be presented when no cluster has started a deployment
 *
 * @module components/empty-collection-content-clusters
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import ContentInfo from 'onepanel-gui/components/content-info';
import layout from 'onepanel-gui/templates/components/content-info';
import { invokeAction } from 'ember-invoke-action';

const {
  computed,
  computed: { readOnly },
  inject: { service },
} = Ember;

// TODO: i18n
export default ContentInfo.extend({
  onepanelServer: service(),
  onepanelServiceType: readOnly('onepanelServer.serviceType'),

  layout,

  header: 'welcome',
  subheader: computed('onepanelServiceType', function () {
    return `to onepanel of ${this.get('onepanelServiceType')}`;
  }),
  text: 'You had not deployed any cluster yet.',
  buttonLabel: 'Create new cluster',

  buttonAction() {
    invokeAction(this, 'start', true);
  }
});
