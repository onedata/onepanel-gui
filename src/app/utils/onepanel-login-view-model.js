/**
 * View Model to use in components displaying login screen elements, specifically
 * in Onepanel (via emergency port).
 *
 * @author Jakub Liput
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import LoginViewModel from 'onedata-gui-common/utils/login-view-model';
import { reads } from '@ember/object/computed';

export default LoginViewModel.extend({
  sessionHasExpired: reads('session.data.hasExpired'),
});
