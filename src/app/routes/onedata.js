import { inject as service } from '@ember/service';
import { get } from '@ember/object';

import OnedataRoute from 'onedata-gui-common/routes/onedata';
import { Promise } from 'rsvp';

export default OnedataRoute.extend({
  beforeModel() {
    this._super(...arguments);
  },
});
