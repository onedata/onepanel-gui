import { inject as service } from '@ember/service';
import { get } from '@ember/object';

import OnedataApplicationRoute from 'onedata-gui-common/routes/application';

export default OnedataApplicationRoute.extend({
  onepanelServer: service(),
  onepanelConfiguration: service(),

  beforeModel(transition) {
    this._super(...arguments);

    this.set('navigationState.queryParams', get(transition, 'queryParams'));
    return this.get('onepanelConfiguration').getConfigurationProxy();
  },
});
