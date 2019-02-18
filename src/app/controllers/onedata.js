/**
 * Support for standalone warning bar
 * 
 * @module controllers/onedata
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import OnedataController from 'onedata-gui-common/controllers/onedata';

export default OnedataController.extend({
  onepanelServer: service(),

  standaloneWarningBarVisible: reads('onepanelServer.isStandalone'),
});
