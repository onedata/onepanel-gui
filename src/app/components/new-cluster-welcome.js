/**
 * Should be presented when no cluster has started a deployment
 *
 * @module components/empty-collection-content-clusters
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';

import { readOnly } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import ContentInfo from 'onedata-gui-common/components/content-info';
import layout from 'onedata-gui-common/templates/components/content-info';
import notImplementedThrow from 'onedata-gui-common/utils/not-implemented-throw';

// TODO: i18n
export default ContentInfo.extend({
  classNames: ['scroll-breakpoint-300'],

  onepanelServer: service(),
  onepanelServiceType: readOnly('onepanelServer.serviceType'),

  layout,

  /**
   * @virtual
   * @type {function}
   */
  start: notImplementedThrow,

  header: 'welcome',
  subheader: computed('onepanelServiceType', function () {
    return `to one${this.get('onepanelServiceType')} panel`;
  }),
  buttonLabel: 'Create new cluster',

  buttonAction() {
    return this.get('start')(true);
  },
});
