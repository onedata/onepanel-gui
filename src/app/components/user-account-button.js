/**
 * Add hosted and emergency Onepanel specific features to common user-account-button
 * 
 * @module components/user-account-button
 * @author Jakub Liput
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';

import UserAccountButton from 'onedata-gui-common/components/user-account-button';

export default UserAccountButton.extend({
  onepanelServer: service(),
  username: reads('onepanelServer.username'),
  isEmergencyOnepanel: reads('onepanelServer.isEmergency'),
});
