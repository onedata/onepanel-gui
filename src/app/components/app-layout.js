/**
 * Main layout and components of application in authenticated mode.
 * Onepanel specific - adds WithBottomBar mixin.
 * 
 * @module components/app-layout
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import AppLayout from 'onedata-gui-common/components/app-layout';
import WithBottomBar from 'onepanel-gui/mixins/components/with-bottom-bar';

export default AppLayout.extend(WithBottomBar);
