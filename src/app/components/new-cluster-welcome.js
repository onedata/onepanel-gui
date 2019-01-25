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
import I18n from 'onedata-gui-common/mixins/components/i18n';
import computedT from 'onedata-gui-common/utils/computed-t';
import { capitalize } from '@ember/string';

// TODO: i18n
export default ContentInfo.extend(I18n, {
  classNames: ['scroll-breakpoint-300'],

  i18nPrefix: 'components.newClusterWelcome',

  guiUtils: service(),

  onepanelServiceType: readOnly('guiUtils.serviceType'),

  layout,

  /**
   * @virtual
   * @type {function}
   */
  start: notImplementedThrow,

  header: computedT('header'),
  subheader: computed('onepanelServiceType', function () {
    const onepanelServiceType = this.get('onepanelServiceType');
    return this.t('subheader', {
      onepanelServiceType,
    });
  }),

  buttonLabel: computed('onepanelServiceType', function () {
    const onepanelServiceType = this.get('onepanelServiceType');
    return this.t('buttonLabel', {
      onepanelServiceType: capitalize(onepanelServiceType),
    });
  }),

  buttonAction() {
    return this.get('start')(true);
  },
});
