/**
 * Adds waiting for gui-context fetch
 * 
 * @module routes/application
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import ApplicationRoute from 'onedata-gui-common/routes/application';
import { inject as service } from '@ember/service';

export default ApplicationRoute.extend({
  onepanelServer: service(),

  beforeModel() {
    const superResult = this._super(...arguments);
    return this.get('onepanelServer').getGuiContextProxy()
      .then(guiContext => {
        if (typeof superResult === 'object') {
          return Object.assign({}, superResult, {
            guiContext,
          });
        } else {
          return {
            guiContext,
          };
        }
      });
  },
});
