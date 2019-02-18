/**
 * Renders a bottom bar that informs user about being on the standalone Onepanel
 * 
 * @module components/standalone-warning-bar
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default Component.extend(I18n, {
  tagName: '',

  onezoneGui: service(),

  onezoneUrl: reads('onezoneGui.clusterUrlInOnepanel'),

  /**
   * @override
   */
  i18nPrefix: 'components.standaloneWarningBar',
});
