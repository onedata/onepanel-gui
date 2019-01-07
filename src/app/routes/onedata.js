import { inject as service } from '@ember/service';
import OnedataRoute from 'onedata-gui-common/routes/onedata';

export default OnedataRoute.extend({
  clusterModelManager: service(),

  beforeModel() {
    this._super(...arguments);
    return this.get('clusterModelManager').getCurrentClusterProxy();
  },
});
