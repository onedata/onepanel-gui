import Service from '@ember/service';
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';

export default Service.extend({
  serviceType: 'oneprovider',
  init() {
    this._super(...arguments);
  },

  getCurrentUser: notImplementedReject,
});
