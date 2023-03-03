/**
 * Adds waiting for gui-context fetch
 *
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import ApplicationRoute from 'onedata-gui-common/routes/application';
import { inject as service } from '@ember/service';
import { resolve } from 'rsvp';

export default ApplicationRoute.extend({
  onepanelServer: service(),

  beforeModel() {
    const superResult = this._super(...arguments);
    return resolve(superResult)
      .then(superResultContent => {
        return this.get('onepanelServer').getGuiContextProxy()
          .then(guiContext => {
            if (superResultContent && typeof superResultContent === 'object') {
              return Object.assign({}, superResultContent, {
                guiContext,
              });
            } else {
              return {
                guiContext,
              };
            }
          });
      });
  },
});
