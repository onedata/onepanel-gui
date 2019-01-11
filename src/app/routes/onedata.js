import { inject as service } from '@ember/service';
import { get, set } from '@ember/object';
import OnedataRoute from 'onedata-gui-common/routes/onedata';

export default OnedataRoute.extend({
  clusterModelManager: service(),
  onepanelServer: service(),

  beforeModel() {
    this._super(...arguments);
    if (this.get('onepanelServer.isInitialized')) {
      return this.get('clusterModelManager').getCurrentClusterProxy();
    } else {
      this.transitionTo('login');
    }
  },

  model() {
    const isHosted = Boolean(this.get('onepanelServer').getClusterIdFromUrl());
    return this._super(...arguments)
      .then(model => {
        if (!isHosted) {
          const items = get(model, 'mainMenuItems');
          items.forEach(item => {
            if (item.id !== 'clusters') {
              set(item, 'disabled', true);
            }
          });
        }
        return model;
      });
  },

});
