/**
 * A login-box header component specific for Onepanel
 *
 * @author Michał Borzęcki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Header from 'onedata-gui-common/components/login-box/header';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import layout from 'onedata-gui-common/templates/components/login-box/header';

export default Header.extend({
  layout,

  guiUtils: service(),

  /**
   * @override
   */
  loginMainTitleClass: reads('guiUtils.serviceType'),

  /**
   * @override
   */
  brandTitle: reads('guiUtils.serviceName'),

  /**
   * @override
   */
  brandSubtitle: reads('guiUtils.serviceDomain'),

  upperTitle: computed(function upperTitle() {
    return this.get('guiUtils.fullServiceName') + ' ' +
      this.get('i18n').t('components.loginBox.header.brandSubtitle');
  }),
});
