import { inject as service } from '@ember/service';
import { get, set } from '@ember/object';
import OnedataRoute from 'onedata-gui-common/routes/onedata';

export default OnedataRoute.extend({
  clusterModelManager: service(),
  onepanelServer: service(),

  beforeModel() {
    this._super(...arguments);
    return this.get('clusterModelManager').getCurrentClusterProxy();
  },

  model() {
    const isHosted = Boolean(this.get('onepanelServer').getClusterIdFromUrl());
    return this._super(...arguments)
      .then(model => {
        if (isHosted) {
          const items = get(model, 'mainMenuItems');
          items.forEach(({ id }) => {
            if (id !== 'clusters') {
              set(items[id], 'disabled', true);
            }
          });
        }
        return model;
      });
  },

});
