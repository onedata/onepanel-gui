import { inject as service } from '@ember/service';
import { get } from '@ember/object';

import OnedataApplicationRoute from 'onedata-gui-common/routes/application';
import { resolve } from 'rsvp';

export default OnedataApplicationRoute.extend({
  onepanelServer: service(),
  // FIXME: mock/debug
  cookies: service(),
  session: service(),

  beforeModel(transition) {
    this._super(...arguments);
    this.set('navigationState.queryParams', get(transition, 'queryParams'));
    // FIXME: mock/debug code
    let basePromise;
    if (get(transition, 'queryParams.fake_login_flag')) {
      basePromise = this.get('session').authenticate('authenticator:application',
        'admin',
        'password'
      );
    } else {
      basePromise = resolve();
    }
    return basePromise.then(() => this.get('onepanelServer').fetchAndSetServiceType());
  },
});
