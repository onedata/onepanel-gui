import { inject as service } from '@ember/service';

import OnedataApplicationRoute from 'onedata-gui-common/routes/application';

export default OnedataApplicationRoute.extend({
  onepanelServer: service(),
  beforeModel() {
    this._super(...arguments);
    return this.get('onepanelServer').fetchAndSetServiceType();
  },
});
