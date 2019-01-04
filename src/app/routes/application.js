import { inject as service } from '@ember/service';
import { get } from '@ember/object';

import OnedataApplicationRoute from 'onedata-gui-common/routes/application';
import { Promise } from 'rsvp';

export default OnedataApplicationRoute.extend({
  onepanelServer: service(),
  onepanelConfiguration: service(),
  clusterModelManager: service(),

  beforeModel(transition) {
    this._super(...arguments);

    const {
      clusterModelManager,
      onepanelServer,
      onepanelConfiguration,
    } = this.getProperties(
      'clusterModelManager',
      'onepanelServer',
      'onepanelConfiguration'
    );

    this.set('navigationState.queryParams', get(transition, 'queryParams'));
    return Promise.all([
      clusterModelManager.getCurrentClusterProxy(),
      onepanelServer.getServiceTypeProxy(),
      // Load onepanel base configuration before gui render
      onepanelConfiguration.getConfigurationProxy(),
    ]);
  },
});
