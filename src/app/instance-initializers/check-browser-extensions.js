/**
 * Runs check for problematic browser extenstions on application init.
 *
 * @author Jakub Liput
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import BlockingAddonDetector from 'onedata-gui-common/utils/blocking-addon-detector';
import config from 'ember-get-config';

export default {
  initialize(applicationInstance) {
    if (
      config.environment !== 'test' &&
      applicationInstance.lookup('service:onepanelServer')?.isEmergency
    ) {
      BlockingAddonDetector.create({ ownerSource: applicationInstance }).runCheck();
    }
  },
};
