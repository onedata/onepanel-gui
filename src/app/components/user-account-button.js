import Ember from 'ember';

import UserAccountButton from 'onedata-gui-common/components/user-account-button';

const {
  inject: { service },
  computed: { alias },
} = Ember;

export default UserAccountButton.extend({
  onepanelServer: service(),
  username: alias('onepanelServer.username'),
});
