import { get } from '@ember/object';

import OnedataApplicationRoute from 'onedata-gui-common/routes/application';

export default OnedataApplicationRoute.extend({
  beforeModel(transition) {
    this._super(...arguments);
    this.set('navigationState.queryParams', get(transition, 'queryParams'));
  },
});
