import Component from '@ember/component';
import { inject as service } from '@ember/service';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import { resolve } from 'rsvp';

export default Component.extend(
  createDataProxyMixin('onezoneOrigin'), {
    onezoneGui: service(),

    path: '',

    fetchOnezoneOrigin() {
      return resolve(this.get('onezoneGui.onezoneOrigin'));
    },

    init() {
      this._super(...arguments);
      this.redirectToOnezone();
    },

    redirectToOnezone() {
      return this.getOnezoneOriginProxy().then(onezoneOrigin => {
        return new Promise(() => {
          window.location =
            `${onezoneOrigin}/ozw/onezone/i#/${this.get('path')}`;
        });
      });
    },
  });
