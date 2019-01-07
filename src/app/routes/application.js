import { inject as service } from '@ember/service';
import { get } from '@ember/object';

import OnedataApplicationRoute from 'onedata-gui-common/routes/application';
import { Promise } from 'rsvp';

export default OnedataApplicationRoute.extend({
  onepanelServer: service(),
  onepanelConfiguration: service(),

  beforeModel(transition) {
    this._super(...arguments);

    const {
      onepanelServer,
      onepanelConfiguration,
    } = this.getProperties(
      'onepanelServer',
      'onepanelConfiguration'
    );

    this.set('navigationState.queryParams', get(transition, 'queryParams'));
    return Promise.all([
      onepanelServer.getServiceTypeProxy(),
      // Load onepanel base configuration before gui render
      onepanelConfiguration.getConfigurationProxy(),
    ]);
  },
});
