import Ember from 'ember';

import OnedataApplicationRoute from 'onedata-gui-common/routes/application';

const {
  inject: { service },
} = Ember;

export default OnedataApplicationRoute.extend({
  onepanelServer: service(),
  beforeModel() {
    this._super(...arguments);
    return this.get('onepanelServer').fetchAndSetServiceType();
  },
});
