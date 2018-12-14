import Component from '@ember/component';
import { inject as service } from '@ember/service';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';

export default Component.extend(
  createDataProxyMixin('onezoneOrigin'), {
    onezoneGui: service(),

    path: '',

    fetchOnezoneOrigin() {
      return this.get('onezoneGui').fetchOnezoneOrigin();
    },

    init() {
      this._super(...arguments);
      this.redirectToOnezone();
    },

    redirectToOnezone() {
      return this.getOnezoneOriginProxy().then(onezoneOrigin => {
        window.location =
          `${onezoneOrigin}/oz/onezone/i#/${this.get('path')}`;
      });
    },
  });
