import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import { computed } from '@ember/object';

import UserAccountButton from 'onedata-gui-common/components/user-account-button';

export default UserAccountButton.extend({
  onepanelServer: service(),
  onezoneGui: service(),
  username: alias('onepanelServer.username'),

  standaloneOnepanel: computed(function disableManageAccount() {
    return !this.get('onepanelServer').getClusterIdFromUrl();
  }),
});
