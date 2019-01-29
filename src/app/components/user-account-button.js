import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';

import UserAccountButton from 'onedata-gui-common/components/user-account-button';

export default UserAccountButton.extend({
  onepanelServer: service(),
  username: alias('onepanelServer.username'),
});
